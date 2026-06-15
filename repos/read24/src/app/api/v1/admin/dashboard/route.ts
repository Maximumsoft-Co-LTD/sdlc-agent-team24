import { NextRequest, NextResponse } from 'next/server'
import { getBooks, getOrders, getRevenueSplits, getAuditLogs } from '@/lib/db/collections'
import { verifyToken } from '@/lib/middleware'

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
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const toDate = to ? new Date(to) : new Date()

  const revSplits = await getRevenueSplits()

  // GMV and revenue splits
  const revPipeline = [
    { $match: { created_at: { $gte: fromDate, $lte: toDate } } },
    {
      $group: {
        _id: null,
        gmv: { $sum: '$gross' },
        platformCut: { $sum: '$platform_cut' },
        publisherShare: { $sum: '$publisher_share' },
        count: { $sum: 1 },
      },
    },
  ]
  const [revKpis] = await revSplits.aggregate(revPipeline).toArray()

  // Buy vs rent count
  const orderTypePipeline = [
    { $match: { created_at: { $gte: fromDate, $lte: toDate } } },
    {
      $lookup: {
        from: 'order_items',
        localField: 'order_item_id',
        foreignField: '_id',
        as: 'oi',
      },
    },
    { $unwind: '$oi' },
    { $group: { _id: '$oi.type', count: { $sum: 1 } } },
  ]
  const orderTypeAgg = await revSplits.aggregate(orderTypePipeline).toArray()
  let buyCount = 0
  let rentCount = 0
  for (const r of orderTypeAgg) {
    if (r._id === 'buy') buyCount = r.count as number
    if (r._id === 'rent') rentCount = r.count as number
  }

  // Books by status
  const books = await getBooks()
  const booksByStatusAgg = await books
    .aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    .toArray()
  const booksByStatus: Record<string, number> = {
    published: 0,
    pendingReview: 0,
    draft: 0,
    suspended: 0,
  }
  for (const s of booksByStatusAgg) {
    const key = s._id as string
    if (key === 'published') booksByStatus.published = s.count as number
    else if (key === 'pending_review') booksByStatus.pendingReview = s.count as number
    else if (key === 'draft') booksByStatus.draft = s.count as number
    else if (key === 'suspended') booksByStatus.suspended = s.count as number
  }

  // Revenue by month
  const revenueByMonthPipeline = [
    { $match: { created_at: { $gte: fromDate, $lte: toDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$created_at' },
          month: { $month: '$created_at' },
        },
        gmv: { $sum: '$gross' },
        platformCut: { $sum: '$platform_cut' },
        publisherShare: { $sum: '$publisher_share' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]
  const revenueByMonthRaw = await revSplits.aggregate(revenueByMonthPipeline).toArray()
  const revenueByMonth = revenueByMonthRaw.map((r) => ({
    month: `${(r._id as { year: number; month: number }).year}-${String((r._id as { year: number; month: number }).month).padStart(2, '0')}`,
    gmv: r.gmv,
    platformCut: r.platformCut,
    publisherShare: r.publisherShare,
  }))

  // Recent orders
  const orders = await getOrders()
  const recentOrders = await orders
    .find({ status: 'paid' }, { sort: { created_at: -1 }, limit: 5 })
    .toArray()

  // Recent audit logs
  const auditLogs = await getAuditLogs()
  const recentAuditLogs = await auditLogs
    .find({}, { sort: { created_at: -1 }, limit: 5 })
    .toArray()

  return NextResponse.json({
    gmv: revKpis?.gmv ?? 0,
    platformCut: revKpis?.platformCut ?? 0,
    publisherShare: revKpis?.publisherShare ?? 0,
    buyCount,
    rentCount,
    booksByStatus,
    revenueByMonth,
    recentOrders: recentOrders.map((o) => ({
      ...o,
      _id: o._id.toString(),
      user_id: o.user_id.toString(),
    })),
    recentAuditLogs: recentAuditLogs.map((l) => ({
      ...l,
      _id: l._id.toString(),
      actor_user_id: l.actor_user_id.toString(),
      target_id: l.target_id?.toString() ?? null,
    })),
  })
}
