import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getAuditLogs } from '@/lib/db/collections'
import { verifyToken } from '@/lib/middleware'

const PAGE_LIMIT = 20

export async function GET(request: NextRequest) {
  let tokenPayload
  try {
    tokenPayload = await verifyToken(request)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (tokenPayload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor')
  const action = searchParams.get('action')
  const target_type = searchParams.get('target_type')

  const filter: Record<string, unknown> = {}
  if (action) filter.action = action
  if (target_type) filter.target_type = target_type
  if (cursor) {
    try {
      filter._id = { $lt: new ObjectId(cursor) }
    } catch {
      return NextResponse.json({ error: 'INVALID_CURSOR' }, { status: 400 })
    }
  }

  const auditLogs = await getAuditLogs()
  const items = await auditLogs
    .find(filter, { sort: { _id: -1 }, limit: PAGE_LIMIT })
    .toArray()

  const nextCursor =
    items.length === PAGE_LIMIT ? items[items.length - 1]._id.toString() : null

  return NextResponse.json({
    items: items.map((log) => ({
      ...log,
      _id: log._id.toString(),
      actor_user_id: log.actor_user_id.toString(),
      target_id: log.target_id?.toString() ?? null,
    })),
    nextCursor,
  })
}
