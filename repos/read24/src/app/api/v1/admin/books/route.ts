import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getBooks, getPublishers } from '@/lib/db/collections'
import { verifyToken } from '@/lib/middleware'

export async function POST(request: NextRequest) {
  let tokenPayload
  try {
    tokenPayload = await verifyToken(request)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (tokenPayload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const { title, author, description, category, price_buy, price_rent, publisherId } =
    body as Record<string, unknown>

  if (!title || !author || !category || price_buy === undefined || !publisherId) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 })
  }

  let publisherObjId: ObjectId
  try {
    publisherObjId = new ObjectId(publisherId as string)
  } catch {
    return NextResponse.json({ error: 'INVALID_PUBLISHER_ID' }, { status: 400 })
  }

  const bookId = new ObjectId()
  const books = await getBooks()
  await books.insertOne({
    _id: bookId,
    title: title as string,
    author: author as string,
    publisher_id: publisherObjId,
    description: description as string | undefined,
    category: category as string,
    price_buy: Number(price_buy),
    price_rent: price_rent != null ? Number(price_rent) : null,
    epub_key: null,
    status: 'draft',
    created_at: new Date(),
  })

  return NextResponse.json({ id: bookId.toString(), status: 'draft' }, { status: 201 })
}

export async function GET(request: NextRequest) {
  let tokenPayload
  try {
    tokenPayload = await verifyToken(request)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (tokenPayload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const statusFilter = searchParams.get('status')
  const publisherFilter = searchParams.get('publisher')

  const filter: Record<string, unknown> = {}
  if (statusFilter) filter.status = statusFilter
  if (publisherFilter) {
    try {
      filter.publisher_id = new ObjectId(publisherFilter)
    } catch {
      return NextResponse.json({ error: 'INVALID_PUBLISHER_ID' }, { status: 400 })
    }
  }

  const books = await getBooks()
  const allBooks = await books.find(filter, { sort: { created_at: -1 } }).toArray()

  const publishers = await getPublishers()

  const result = await Promise.all(
    allBooks.map(async (b) => {
      const publisher = await publishers.findOne({ _id: b.publisher_id })
      return {
        ...b,
        _id: b._id.toString(),
        publisher_id: b.publisher_id?.toString(),
        publisherName: publisher?.name ?? null,
      }
    })
  )

  return NextResponse.json({ books: result })
}

export async function PATCH() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
