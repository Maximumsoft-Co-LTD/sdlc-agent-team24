import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getRevenueSplits, getAuditLogs } from '@/lib/db/collections'
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
  const publisherFilter = searchParams.get('publisher')
  const exportCsv = searchParams.get('export') === 'csv'

  const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const toDate = to ? new Date(to) : new Date()

  const matchStage: Record<string, unknown> = {
    created_at: { $gte: fromDate, $lte: toDate },
  }
  if (publisherFilter) {
    try {
      matchStage.publisher_id = new ObjectId(publisherFilter)
    } catch {
      return NextResponse.json({ error: 'INVALID_PUBLISHER_ID' }, { status: 400 })
    }
  }

  const revSplits = await getRevenueSplits()

  // Summary
  const summaryAgg = await revSplits
    .aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          gmv: { $sum: '$gross' },
          gatewayFee: { $sum: '$gateway_fee' },
          net: { $sum: '$net' },
          platformCut: { $sum: '$platform_cut' },
          publisherShare: { $sum: '$publisher_share' },
        },
      },
    ])
    .toArray()

  const summary = summaryAgg[0] ?? {
    gmv: 0,
    gatewayFee: 0,
    net: 0,
    platformCut: 0,
    publisherShare: 0,
  }

  // By publisher
  const byPublisherAgg = await revSplits
    .aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$publisher_id',
          gmv: { $sum: '$gross' },
          publisherShare: { $sum: '$publisher_share' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'publishers',
          localField: '_id',
          foreignField: '_id',
          as: 'publisher',
        },
      },
      { $unwind: { path: '$publisher', preserveNullAndEmpty: true } },
    ])
    .toArray()

  const byPublisher = byPublisherAgg.map((r) => ({
    publisherId: (r._id as ObjectId).toString(),
    publisherName: (r.publisher as { name?: string })?.name ?? null,
    gmv: r.gmv,
    publisherShare: r.publisherShare,
    count: r.count,
  }))

  // Detailed items with book and publisher join
  const items = await revSplits
    .aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'order_items',
          localField: 'order_item_id',
          foreignField: '_id',
          as: 'oi',
        },
      },
      { $unwind: { path: '$oi', preserveNullAndEmpty: true } },
      {
        $lookup: {
          from: 'books',
          localField: 'oi.book_id',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: { path: '$book', preserveNullAndEmpty: true } },
      {
        $lookup: {
          from: 'publishers',
          localField: 'publisher_id',
          foreignField: '_id',
          as: 'publisher',
        },
      },
      { $unwind: { path: '$publisher', preserveNullAndEmpty: true } },
      { $sort: { created_at: -1 } },
    ])
    .toArray()

  if (exportCsv) {
    // Log audit
    const auditLogs = await getAuditLogs()
    await auditLogs.insertOne({
      _id: new ObjectId(),
      actor_user_id: new ObjectId(tokenPayload.userId),
      actor_role: 'admin',
      action: 'payout',
      target_type: 'revenue',
      metadata: { note: 'CSV export' },
      created_at: new Date(),
    })

    const header = 'date,book,gross,gateway_fee,net,platform_cut,publisher_share'
    const rows = items.map((r) => {
      const date = (r.created_at as Date).toISOString().split('T')[0]
      const bookTitle = ((r.book as { title?: string })?.title ?? '').replace(/,/g, ' ')
      return `${date},${bookTitle},${r.gross},${r.gateway_fee},${r.net},${r.platform_cut},${r.publisher_share}`
    })
    const csv = [header, ...rows].join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="revenue.csv"',
      },
    })
  }

  return NextResponse.json({
    summary: {
      gmv: summary.gmv,
      gatewayFee: summary.gatewayFee,
      net: summary.net,
      platformCut: summary.platformCut,
      publisherShare: summary.publisherShare,
    },
    byPublisher,
    items: items.map((r) => ({
      ...r,
      _id: r._id.toString(),
      order_item_id: r.order_item_id.toString(),
      publisher_id: r.publisher_id.toString(),
    })),
  })
}
