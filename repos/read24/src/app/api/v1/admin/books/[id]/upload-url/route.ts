import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3Client, BUCKET } from '@/lib/minio'
import { getBooks } from '@/lib/db/collections'
import { verifyToken } from '@/lib/middleware'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let tokenPayload
  try {
    tokenPayload = await verifyToken(request)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (tokenPayload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let bookId: ObjectId
  try {
    bookId = new ObjectId(params.id)
  } catch {
    return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })
  }

  const books = await getBooks()
  const book = await books.findOne({ _id: bookId })
  if (!book) {
    return NextResponse.json({ error: 'BOOK_NOT_FOUND' }, { status: 404 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const { fileType } = body as { fileType?: string }
  if (!fileType || !['epub', 'cover'].includes(fileType)) {
    return NextResponse.json({ error: 'INVALID_FILE_TYPE' }, { status: 400 })
  }

  const extension = fileType === 'epub' ? 'epub' : 'jpg'
  const key = `books/${params.id}/${fileType}.${extension}`

  const command = new PutObjectCommand({ Bucket: BUCKET, Key: key })
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })

  // If epub, store the epub_key on the book record
  if (fileType === 'epub') {
    await books.updateOne({ _id: bookId }, { $set: { epub_key: key } })
  }

  return NextResponse.json({ uploadUrl, key })
}
