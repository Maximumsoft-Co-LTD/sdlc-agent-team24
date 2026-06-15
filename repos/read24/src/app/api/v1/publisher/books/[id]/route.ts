import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getBooks, getAuditLogs } from '@/lib/db/collections'
import { verifyToken } from '@/lib/middleware'

export async function PATCH(
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

  if (!['draft', 'rejected'].includes(book.status)) {
    return NextResponse.json({ error: 'CANNOT_EDIT_IN_CURRENT_STATUS' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const { title, author, description, category, price_buy, price_rent } =
    body as Record<string, unknown>

  const updates: Record<string, unknown> = { updated_at: new Date() }
  const priceChanged = price_buy !== undefined && Number(price_buy) !== book.price_buy

  if (title !== undefined) updates.title = title as string
  if (author !== undefined) updates.author = author as string
  if (description !== undefined) updates.description = description as string
  if (category !== undefined) updates.category = category as string
  if (price_buy !== undefined) updates.price_buy = Number(price_buy)
  if (price_rent !== undefined) updates.price_rent = price_rent != null ? Number(price_rent) : null

  await books.updateOne({ _id: bookId }, { $set: updates })

  // Audit log for price change
  if (priceChanged) {
    const auditLogs = await getAuditLogs()
    await auditLogs.insertOne({
      _id: new ObjectId(),
      actor_user_id: new ObjectId(tokenPayload.userId),
      actor_role: 'publisher',
      action: 'price_change',
      target_type: 'book',
      target_id: bookId,
      metadata: { old_price: book.price_buy, new_price: Number(price_buy) },
      created_at: new Date(),
    })
  }

  const updated = await books.findOne({ _id: bookId })
  return NextResponse.json({
    ...updated,
    _id: updated!._id.toString(),
    publisher_id: updated!.publisher_id.toString(),
  })
}
