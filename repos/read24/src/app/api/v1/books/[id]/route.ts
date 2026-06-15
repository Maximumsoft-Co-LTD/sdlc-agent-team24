import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getBooks } from '@/lib/db/collections'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  let bookId: ObjectId
  try {
    bookId = new ObjectId(params.id)
  } catch {
    return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })
  }

  const books = await getBooks()
  const book = await books.findOne(
    { _id: bookId, status: 'published' },
    { projection: { epub_key: 0 } }
  )

  if (!book) {
    return NextResponse.json({ error: 'BOOK_NOT_FOUND' }, { status: 404 })
  }

  return NextResponse.json({
    ...book,
    _id: book._id.toString(),
    publisher_id: book.publisher_id?.toString(),
  })
}
