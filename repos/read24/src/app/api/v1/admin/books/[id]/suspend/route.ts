import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getBooks, getAuditLogs } from '@/lib/db/collections'
import { verifyToken } from '@/lib/middleware'

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

  const now = new Date()
  // Do NOT touch existing entitlements (spec: entitlement เดิมใช้ได้)
  await books.updateOne(
    { _id: bookId },
    { $set: { status: 'suspended', updated_at: now } }
  )

  const actorUserId = new ObjectId(tokenPayload.userId)

  const auditLogs = await getAuditLogs()
  await auditLogs.insertOne({
    _id: new ObjectId(),
    actor_user_id: actorUserId,
    actor_role: 'admin',
    action: 'suspend',
    target_type: 'book',
    target_id: bookId,
    created_at: now,
  })

  const history = await getBookStatusHistory()
  await history.insertOne({
    _id: new ObjectId(),
    book_id: bookId,
    status: 'suspended',
    actor_user_id: actorUserId,
    created_at: now,
  })

  return NextResponse.json({ status: 'suspended' })
}
