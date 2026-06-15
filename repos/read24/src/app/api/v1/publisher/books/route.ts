import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getBooks, getRevenueSplits, getAuditLogs } from '@/lib/db/collections'
import { verifyToken } from '@/lib/middleware'

async function authorizePublisher(request: NextRequest) {
  let token
  try {
    token = await verifyToken(request)
  } catch {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (token.role !== 'publisher') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  if (!token.publisherId) {
    return { error: NextResponse.json({ error: 'PUBLISHER_ID_MISSING' }, { status: 403 }) }
  }
  return { token, publisherId: new ObjectId(token.publisherId) }
}

export async function GET(request: NextRequest) {
  const auth = await authorizePublisher(request)
  if (auth.error) return auth.error

  const { publisherId } = auth
  const { searchParams } = new URL(request.url)
  const statusFilter = searchParams.get('status')

  const filter: Record<string, unknown> = { publisher_id: publisherId }
  if (statusFilter) filter.status = statusFilter

  const books = await getBooks()
  const bookList = await books.find(filter, { sort: { created_at: -1 } }).toArray()

  const revSplits = await getRevenueSplits()

  const result = await Promise.all(
    bookList.map(async (b) => {
      const salesAgg = await revSplits
        .aggregate([
          { $match: { publisher_id: publisherId } },
          {
            $lookup: {
              from: 'order_items',
              localField: 'order_item_id',
              foreignField: '_id',
              as: 'oi',
            },
          },
          { $unwind: '$oi' },
          { $match: { 'oi.book_id': b._id } },
          { $group: { _id: null, totalSales: { $sum: '$publisher_share' } } },
        ])
        .toArray()

      return {
        ...b,
        _id: b._id.toString(),
        publisher_id: b.publisher_id.toString(),
        totalSales: salesAgg[0]?.totalSales ?? 0,
      }
    })
  )

  return NextResponse.json({ books: result })
}

export async function POST(request: NextRequest) {
  const auth = await authorizePublisher(request)
  if (auth.error) return auth.error

  const { token, publisherId } = auth

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const { title, author, description, category, price_buy, price_rent } =
    body as Record<string, unknown>

  if (!title || !author || !category || price_buy === undefined) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 })
  }

  const book = {
    _id: new ObjectId(),
    title: title as string,
    author: author as string,
    description: (description as string) ?? '',
    category: category as string,
    price_buy: Number(price_buy),
    price_rent: price_rent != null ? Number(price_rent) : null,
    rent_days: 7,
    publisher_id: publisherId!,
    status: 'draft' as const,
    is_exclusive: false,
    cover_url: null,
    epub_key: null,
    created_at: new Date(),
    published_at: null,
  }

  const books = await getBooks()
  await books.insertOne(book)

  // Audit log
  const auditLogs = await getAuditLogs()
  await auditLogs.insertOne({
    _id: new ObjectId(),
    actor_user_id: new ObjectId(token!.userId),
    actor_role: 'publisher',
    action: 'create_book',
    target_type: 'book',
    target_id: book._id,
    created_at: new Date(),
  })

  return NextResponse.json({ id: book._id.toString(), status: 'draft' }, { status: 201 })
}
