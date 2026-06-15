import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getBooks, getRevenueSplits } from '@/lib/db/collections'
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

  const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const toDate = to ? new Date(to) : new Date()

  const revSplits = await getRevenueSplits()
  const pipeline = [
    {
      $match: {
        publisher_id: publisherId,
        created_at: { $gte: fromDate, $lte: toDate },
      },
    },
    {
      $group: {
        _id: null,
        myGmv: { $sum: '$gross' },
        myPublisherShare: { $sum: '$publisher_share' },
        count: { $sum: 1 },
      },
    },
  ]

  const [kpis] = await revSplits.aggregate(pipeline).toArray()

  const books = await getBooks()
  const booksByStatus = await books
    .aggregate([
      { $match: { publisher_id: publisherId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])
    .toArray()

  const statusMap: Record<string, number> = {}
  for (const s of booksByStatus) {
    statusMap[s._id as string] = s.count as number
  }

  // Count sold and rented items
  const orderItemsLookup = await revSplits
    .aggregate([
      { $match: { publisher_id: publisherId } },
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
    ])
    .toArray()

  let soldCount = 0
  let rentCount = 0
  for (const r of orderItemsLookup) {
    if (r._id === 'buy') soldCount = r.count as number
    if (r._id === 'rent') rentCount = r.count as number
  }

  return NextResponse.json({
    myGmv: kpis?.myGmv ?? 0,
    myPublisherShare: kpis?.myPublisherShare ?? 0,
    bookCount: Object.values(statusMap).reduce((a, b) => a + b, 0),
    soldCount,
    rentCount,
    revenueByMonth: [],
  })
}
