import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { HeadObjectCommand } from '@aws-sdk/client-s3'
import { s3Client, BUCKET } from '@/lib/minio'
import { getBooks, getAuditLogs } from '@/lib/db/collections'
import { verifyToken } from '@/lib/middleware'

// book_status_history is stored in its own collection
async function getBookStatusHistory() {
  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  return db.collection('book_status_history')
}

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

  if (!book.epub_key) {
    return NextResponse.json({ error: 'EPUB_NOT_UPLOADED' }, { status: 400 })
  }

  // Verify the epub file exists in MinIO
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: book.epub_key }))
  } catch {
    return NextResponse.json({ error: 'EPUB_FILE_NOT_FOUND_IN_STORAGE' }, { status: 400 })
  }

  const now = new Date()
  await books.updateOne(
    { _id: bookId },
    { $set: { status: 'published', published_at: now } }
  )

  const actorUserId = new ObjectId(tokenPayload.userId)

  // Audit log
  const auditLogs = await getAuditLogs()
  await auditLogs.insertOne({
    _id: new ObjectId(),
    actor_user_id: actorUserId,
    actor_role: 'admin',
    action: 'publish',
    target_type: 'book',
    target_id: bookId,
    created_at: now,
  })

  // Book status history
  const history = await getBookStatusHistory()
  await history.insertOne({
    _id: new ObjectId(),
    book_id: bookId,
    status: 'published',
    actor_user_id: actorUserId,
    created_at: now,
  })

  return NextResponse.json({ status: 'published' })
}
