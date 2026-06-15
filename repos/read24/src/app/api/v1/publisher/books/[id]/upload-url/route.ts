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
  if (tokenPayload.role !== 'publisher') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (!tokenPayload.publisherId) {
    return NextResponse.json({ error: 'PUBLISHER_ID_MISSING' }, { status: 403 })
  }

  let bookId: ObjectId
  try {
    bookId = new ObjectId(params.id)
  } catch {
    return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })
  }

  const publisherId = new ObjectId(tokenPayload.publisherId)
  const books = await getBooks()
  const book = await books.findOne({ _id: bookId, publisher_id: publisherId })
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

  const key =
    fileType === 'epub'
      ? `books/${params.id}/book.epub`
      : `books/${params.id}/cover.jpg`

  const command = new PutObjectCommand({ Bucket: BUCKET, Key: key })
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })

  const updateSet: Record<string, unknown> = { updated_at: new Date() }
  if (fileType === 'epub') {
    updateSet.epub_key = key
  } else {
    const endpoint = process.env.MINIO_ENDPOINT
    const port = process.env.MINIO_PORT
    updateSet.cover_url = `http://${endpoint}:${port}/${BUCKET}/${key}`
  }

  await books.updateOne({ _id: bookId }, { $set: updateSet })

  return NextResponse.json({ uploadUrl, key })
}
