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
  if (tokenPayload.role !== 'publisher') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (!tokenPayload.publisherId) {
    return NextResponse.json({ error: 'PUBLISHER_ID_MISSING' }, { status: 403 })
  }

  const publisherId = new ObjectId(tokenPayload.publisherId)
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const exportCsv = searchParams.get('export') === 'csv'

  const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const toDate = to ? new Date(to) : new Date()

  const revSplits = await getRevenueSplits()
  const items = await revSplits
    .aggregate([
      {
        $match: {
          publisher_id: publisherId,
          created_at: { $gte: fromDate, $lte: toDate },
        },
      },
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
      { $sort: { created_at: -1 } },
    ])
    .toArray()

  if (exportCsv) {
    // Log audit
    const auditLogs = await getAuditLogs()
    await auditLogs.insertOne({
      _id: new ObjectId(),
      actor_user_id: new ObjectId(tokenPayload.userId),
      actor_role: 'publisher',
      action: 'payout',
      target_type: 'publisher',
      target_id: publisherId,
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
    items: items.map((r) => ({
      ...r,
      _id: r._id.toString(),
      order_item_id: r.order_item_id.toString(),
      publisher_id: r.publisher_id.toString(),
    })),
  })
}
