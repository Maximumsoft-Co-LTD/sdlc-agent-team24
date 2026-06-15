import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import {
  getBooks,
  getOrders,
  getOrderItems,
  getEntitlements,
  getRevenueSplits,
  getPublishers,
  getWallets,
  getWalletTransactions,
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

  const { bookId, type, paymentMethod } = body as Record<string, string>

  if (!bookId || !type || !paymentMethod) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 })
  }
  if (!['buy', 'rent'].includes(type)) {
    return NextResponse.json({ error: 'INVALID_TYPE' }, { status: 400 })
  }
  if (!['mock', 'coin'].includes(paymentMethod)) {
    return NextResponse.json({ error: 'INVALID_PAYMENT_METHOD' }, { status: 400 })
  }

  let bookObjId: ObjectId
  try {
    bookObjId = new ObjectId(bookId)
  } catch {
    return NextResponse.json({ error: 'INVALID_BOOK_ID' }, { status: 400 })
  }

  const books = await getBooks()
  const book = await books.findOne({ _id: bookObjId, status: 'published' })
  if (!book) {
    return NextResponse.json({ error: 'BOOK_NOT_FOUND' }, { status: 404 })
  }

  if (type === 'rent' && book.price_rent == null) {
    return NextResponse.json({ error: 'RENT_NOT_AVAILABLE' }, { status: 400 })
  }

  const userId = new ObjectId(tokenPayload.userId)

  // Check duplicate entitlement
  const entitlements = await getEntitlements()
  const existing = await entitlements.findOne({
    user_id: userId,
    book_id: bookObjId,
    status: 'active',
  })
  if (existing) {
    return NextResponse.json({ error: 'DUPLICATE_ENTITLEMENT' }, { status: 409 })
  }

  const gross = type === 'buy' ? book.price_buy : book.price_rent!

  // Handle coin payment — deduct balance atomically
  if (paymentMethod === 'coin') {
    const wallets = await getWallets()
    const result = await wallets.updateOne(
      { user_id: userId, balance: { $gte: gross } },
      { $inc: { balance: -gross }, $set: { updated_at: new Date() } }
    )
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'INSUFFICIENT_COINS' }, { status: 402 })
    }
  }

  // Create order
  const orders = await getOrders()
  const orderId = new ObjectId()
  await orders.insertOne({
    _id: orderId,
    user_id: userId,
    status: 'paid',
    amount_gross: gross,
    payment_method: paymentMethod as 'mock' | 'coin',
    payment_ref: `mock-${orderId.toString()}`,
    created_at: new Date(),
    paid_at: new Date(),
  })

  // Create order item
  const orderItems = await getOrderItems()
  const orderItemId = new ObjectId()
  await orderItems.insertOne({
    _id: orderItemId,
    order_id: orderId,
    book_id: bookObjId,
    type: type as 'buy' | 'rent',
    unit_price: gross,
    rent_days: type === 'rent' ? (book.rent_days ?? 7) : null,
  })

  // Create entitlement
  const entitlementId = new ObjectId()
  const expires_at =
    type === 'rent'
      ? new Date(Date.now() + (book.rent_days ?? 7) * 24 * 60 * 60 * 1000)
      : null
  await entitlements.insertOne({
    _id: entitlementId,
    user_id: userId,
    book_id: bookObjId,
    order_item_id: orderItemId,
    type: type === 'buy' ? 'own' : 'rent',
    status: 'active',
    expires_at,
    created_at: new Date(),
  })

  // Revenue split
  const publishers = await getPublishers()
  const publisher = await publishers.findOne({ _id: book.publisher_id })
  const revenueShare = publisher?.revenue_share ?? 0.70

  const gateway_fee = paymentMethod === 'coin' ? 0 : Math.round(gross * 0.015)
  const net = gross - gateway_fee
  const publisher_share = Math.round(net * revenueShare)
  const platform_cut = net - publisher_share

  const revSplits = await getRevenueSplits()
  await revSplits.insertOne({
    _id: new ObjectId(),
    order_item_id: orderItemId,
    gross,
    gateway_fee,
    net,
    platform_cut,
    publisher_share,
    publisher_id: book.publisher_id,
    created_at: new Date(),
  })

  // If coin payment, record wallet transaction
  if (paymentMethod === 'coin') {
    const wallets = await getWallets()
    const wallet = await wallets.findOne({ user_id: userId })
    const walletTxns = await getWalletTransactions()
    await walletTxns.insertOne({
      _id: new ObjectId(),
      wallet_id: wallet!._id,
      type: 'spend',
      amount: -gross,
      balance_after: wallet!.balance,
      ref_type: 'order',
      ref_id: orderId,
      created_at: new Date(),
    })
  }

  return NextResponse.json(
    { orderId: orderId.toString(), entitlementId: entitlementId.toString() },
    { status: 201 }
  )
}

export async function GET(request: NextRequest) {
  let tokenPayload
  try {
    tokenPayload = await verifyToken(request)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = new ObjectId(tokenPayload.userId)
  const orders = await getOrders()
  const userOrders = await orders
    .find({ user_id: userId }, { sort: { created_at: -1 } })
    .toArray()

  return NextResponse.json({
    orders: userOrders.map((o) => ({
      ...o,
      _id: o._id.toString(),
      user_id: o.user_id.toString(),
    })),
  })
}
