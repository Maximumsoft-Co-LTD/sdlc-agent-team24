import { NextRequest, NextResponse } from 'next/server'
import { getBooks } from '@/lib/db/collections'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50)

  if (!q) {
    return NextResponse.json({ error: 'MISSING_QUERY' }, { status: 400 })
  }

  const books = await getBooks()

  const items = await books
    .find(
      { $text: { $search: q }, status: 'published' },
      {
        projection: { epub_key: 0, score: { $meta: 'textScore' } },
        sort: { score: { $meta: 'textScore' } },
        limit,
      }
    )
    .toArray()

  return NextResponse.json({
    items: items.map((b) => ({
      ...b,
      _id: b._id.toString(),
      publisher_id: b.publisher_id?.toString(),
    })),
  })
}
