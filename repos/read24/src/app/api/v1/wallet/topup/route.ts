import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import {
  getWallets,
  getWalletTransactions,
  getCoinPackages,
  getTopups,
} from '@/lib/db/collections'
import { verifyToken } from '@/lib/middleware'

export async function POST(request: NextRequest) {
  let tokenPayload
  try {
    tokenPayload = await verifyToken(request)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const { packageId } = body as Record<string, string>
  if (!packageId) {
    return NextResponse.json({ error: 'MISSING_PACKAGE_ID' }, { status: 400 })
  }

  let packageObjId: ObjectId
  try {
    packageObjId = new ObjectId(packageId)
  } catch {
    return NextResponse.json({ error: 'INVALID_PACKAGE_ID' }, { status: 400 })
  }

  const pkgs = await getCoinPackages()
  const pkg = await pkgs.findOne({ _id: packageObjId, active: true })
  if (!pkg) {
    return NextResponse.json({ error: 'PACKAGE_NOT_FOUND' }, { status: 404 })
  }

  const userId = new ObjectId(tokenPayload.userId)
  const totalCoins = pkg.coins + pkg.bonus

  // Atomic add coins to wallet
  const wallets = await getWallets()
  await wallets.updateOne(
    { user_id: userId },
    { $inc: { balance: totalCoins }, $set: { updated_at: new Date() } }
  )

  // Fetch updated wallet balance
  const wallet = await wallets.findOne({ user_id: userId })
  if (!wallet) {
    return NextResponse.json({ error: 'WALLET_NOT_FOUND' }, { status: 404 })
  }

  const now = new Date()
  const topupId = new ObjectId()

  // Create topup record
  const topups = await getTopups()
  await topups.insertOne({
    _id: topupId,
    user_id: userId,
    package_id: packageObjId,
    coins: totalCoins,
    amount_thb: pkg.price_thb,
    status: 'completed',
    payment_ref: `mock-topup-${topupId.toString()}`,
    created_at: now,
    updated_at: now,
  })

  // Create wallet transaction records
  const walletTxns = await getWalletTransactions()

  // balance_after for topup transaction: if bonus > 0, the topup coins landed first
  // After both credits: wallet.balance is the final state
  // Work backwards: final balance - bonus = balance_after_topup
  const balanceAfterBonus = wallet.balance
  const balanceAfterTopup = pkg.bonus > 0 ? balanceAfterBonus - pkg.bonus : balanceAfterBonus

  await walletTxns.insertOne({
    _id: new ObjectId(),
    wallet_id: wallet._id,
    type: 'topup',
    amount: pkg.coins,
    balance_after: balanceAfterTopup,
    ref_type: 'topup',
    ref_id: topupId,
    created_at: now,
  })

  if (pkg.bonus > 0) {
    await walletTxns.insertOne({
      _id: new ObjectId(),
      wallet_id: wallet._id,
      type: 'bonus',
      amount: pkg.bonus,
      balance_after: balanceAfterBonus,
      ref_type: 'topup',
      ref_id: topupId,
      created_at: now,
    })
  }

  return NextResponse.json(
    {
      topupId: topupId.toString(),
      coins: pkg.coins,
      bonus: pkg.bonus,
      balance: wallet.balance,
    },
    { status: 201 }
  )
}
