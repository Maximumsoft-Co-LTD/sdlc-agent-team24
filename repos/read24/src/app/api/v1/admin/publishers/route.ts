import { NextRequest, NextResponse } from 'next/server'
import { getPublishers, getBooks, getRevenueSplits } from '@/lib/db/collections'
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

  const publishers = await getPublishers()
  const allPublishers = await publishers.find({}).toArray()

  const books = await getBooks()
  const revSplits = await getRevenueSplits()

  const items = await Promise.all(
    allPublishers.map(async (pub) => {
      const bookCount = await books.countDocuments({ publisher_id: pub._id })

      const earningsAgg = await revSplits
        .aggregate([
          { $match: { publisher_id: pub._id } },
          { $group: { _id: null, totalEarnings: { $sum: '$publisher_share' } } },
        ])
        .toArray()

      return {
        id: pub._id.toString(),
        name: pub.name,
        revenue_share: pub.revenue_share,
        bookCount,
        totalEarnings: earningsAgg[0]?.totalEarnings ?? 0,
      }
    })
  )

  return NextResponse.json({ items })
}
