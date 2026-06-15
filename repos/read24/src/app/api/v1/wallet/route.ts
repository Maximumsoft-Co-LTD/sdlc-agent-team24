import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getWallets } from '@/lib/db/collections'
import { verifyToken } from '@/lib/middleware'

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

  return NextResponse.json({
    balance: wallet.balance,
    userId: userId.toString(),
  })
}
