import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { HeadObjectCommand } from '@aws-sdk/client-s3'
import { s3Client, BUCKET } from '@/lib/minio'
import { getBooks, getAuditLogs } from '@/lib/db/collections'
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

  // Verify epub_key exists
  if (!book.epub_key) {
    return NextResponse.json({ error: 'EPUB_NOT_UPLOADED' }, { status: 400 })
  }

  // Verify file actually exists in MinIO
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: book.epub_key }))
  } catch {
    return NextResponse.json({ error: 'EPUB_FILE_NOT_FOUND_IN_STORAGE' }, { status: 400 })
  }

  // Verify price_buy > 0
  if (!book.price_buy || book.price_buy <= 0) {
    return NextResponse.json({ error: 'INVALID_PRICE' }, { status: 400 })
  }

  await books.updateOne(
    { _id: bookId },
    { $set: { status: 'pending_review', updated_at: new Date() } }
  )

  const auditLogs = await getAuditLogs()
  await auditLogs.insertOne({
    _id: new ObjectId(),
    actor_user_id: new ObjectId(tokenPayload.userId),
    actor_role: 'publisher',
    action: 'submit',
    target_type: 'book',
    target_id: bookId,
    created_at: new Date(),
  })

  return NextResponse.json({ status: 'pending_review' })
}
