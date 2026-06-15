import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getBooks } from '@/lib/db/collections'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50)
  const category = searchParams.get('category')
  const sort = searchParams.get('sort') || 'newest'

  const books = await getBooks()

  const filter: Record<string, unknown> = { status: 'published' }
  if (category) filter.category = category
  if (cursor) {
    try {
      filter._id = { $lt: new ObjectId(cursor) }
    } catch {
      return NextResponse.json({ error: 'INVALID_CURSOR' }, { status: 400 })
    }
  }

  const sortObj = sort === 'popular' ? { price_buy: -1 as const } : { _id: -1 as const }

  const items = await books
    .find(filter, {
      projection: { epub_key: 0 },
      sort: sortObj,
      limit: limit + 1,
    })
    .toArray()

  const hasMore = items.length > limit
  const result = hasMore ? items.slice(0, limit) : items

  return NextResponse.json({
    items: result.map((b) => ({
      ...b,
      _id: b._id.toString(),
      publisher_id: b.publisher_id?.toString(),
    })),
    nextCursor: hasMore ? result[result.length - 1]._id.toString() : null,
  })
}

export async function POST() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
