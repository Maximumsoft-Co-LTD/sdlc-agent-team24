import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getPublishers, getAuditLogs } from '@/lib/db/collections'
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
  if (tokenPayload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let publisherId: ObjectId
  try {
    publisherId = new ObjectId(params.id)
  } catch {
    return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const { revenue_share } = body as Record<string, unknown>
  if (revenue_share === undefined) {
    return NextResponse.json({ error: 'MISSING_REVENUE_SHARE' }, { status: 400 })
  }

  const publishers = await getPublishers()
  const publisher = await publishers.findOne({ _id: publisherId })
  if (!publisher) {
    return NextResponse.json({ error: 'PUBLISHER_NOT_FOUND' }, { status: 404 })
  }

  await publishers.updateOne(
    { _id: publisherId },
    { $set: { revenue_share: Number(revenue_share) } }
  )

  const auditLogs = await getAuditLogs()
  await auditLogs.insertOne({
    _id: new ObjectId(),
    actor_user_id: new ObjectId(tokenPayload.userId),
    actor_role: 'admin',
    action: 'price_change',
    target_type: 'publisher',
    target_id: publisherId,
    metadata: { note: `revenue_share changed to ${revenue_share}` },
    created_at: new Date(),
  })

  return NextResponse.json({ revenue_share: Number(revenue_share) })
}
