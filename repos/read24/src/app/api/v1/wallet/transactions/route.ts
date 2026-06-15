import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getWallets, getWalletTransactions } from '@/lib/db/collections'
import { verifyToken } from '@/lib/middleware'

const PAGE_LIMIT = 20

export async function GET(request: NextRequest) {
  let tokenPayload
  try {
    tokenPayload = await verifyToken(request)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = new ObjectId(tokenPayload.userId)
  const wallets = await getWallets()
  const wallet = await wallets.findOne({ user_id: userId })
  if (!wallet) {
    return NextResponse.json({ error: 'WALLET_NOT_FOUND' }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor')

  const filter: Record<string, unknown> = { wallet_id: wallet._id }
  if (cursor) {
    try {
      filter._id = { $lt: new ObjectId(cursor) }
    } catch {
      return NextResponse.json({ error: 'INVALID_CURSOR' }, { status: 400 })
    }
  }

  const walletTxns = await getWalletTransactions()
  const items = await walletTxns
    .find(filter, { sort: { _id: -1 }, limit: PAGE_LIMIT })
    .toArray()

  const nextCursor =
    items.length === PAGE_LIMIT ? items[items.length - 1]._id.toString() : null

  return NextResponse.json({
    items: items.map((t) => ({
      ...t,
      _id: t._id.toString(),
      wallet_id: t.wallet_id.toString(),
      ref_id: t.ref_id?.toString() ?? null,
    })),
    nextCursor,
  })
}
