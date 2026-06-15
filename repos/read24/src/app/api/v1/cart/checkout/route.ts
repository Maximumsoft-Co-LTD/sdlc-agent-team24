import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import {
  getCarts,
  getCartItems,
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

  const { paymentMethod } = body as Record<string, string>
  if (!paymentMethod || !['coin', 'mock'].includes(paymentMethod)) {
    return NextResponse.json({ error: 'INVALID_PAYMENT_METHOD' }, { status: 400 })
  }

  const userId = new ObjectId(tokenPayload.userId)
  const carts = await getCarts()
  const cart = await carts.findOne({ user_id: userId })

  if (!cart) {
    return NextResponse.json({ error: 'CART_EMPTY' }, { status: 400 })
  }

  const cartItemsColl = await getCartItems()
  const cartItems = await cartItemsColl.find({ cart_id: cart._id }).toArray()

  if (cartItems.length === 0) {
    return NextResponse.json({ error: 'CART_EMPTY' }, { status: 400 })
  }

  // Fetch all books and calculate total
  const books = await getBooks()
  const bookDocs = await Promise.all(
    cartItems.map((item) => books.findOne({ _id: item.book_id }))
  )

  const total = bookDocs.reduce((sum, b) => sum + (b?.price_buy ?? 0), 0)

  // Coin payment: atomic deduct
  if (paymentMethod === 'coin') {
    const wallets = await getWallets()
    const result = await wallets.updateOne(
      { user_id: userId, balance: { $gte: total } },
      { $inc: { balance: -total }, $set: { updated_at: new Date() } }
    )
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'INSUFFICIENT_COINS' }, { status: 402 })
    }
  }

  const now = new Date()

  // Create order
  const ordersCol = await getOrders()
  const orderId = new ObjectId()
  await ordersCol.insertOne({
    _id: orderId,
    user_id: userId,
    status: 'paid',
    amount_gross: total,
    payment_method: paymentMethod as 'mock' | 'coin',
    payment_ref: `mock-${orderId.toString()}`,
    created_at: now,
    paid_at: now,
  })

  // Process each item
  const orderItemsColl = await getOrderItems()
  const entitlements = await getEntitlements()
  const revSplits = await getRevenueSplits()
  const publishers = await getPublishers()

  for (let i = 0; i < cartItems.length; i++) {
    const book = bookDocs[i]
    if (!book) continue

    const gross = book.price_buy
    const orderItemId = new ObjectId()

    await orderItemsColl.insertOne({
      _id: orderItemId,
      order_id: orderId,
      book_id: book._id,
      type: 'buy',
      unit_price: gross,
      rent_days: null,
    })

    await entitlements.insertOne({
      _id: new ObjectId(),
      user_id: userId,
      book_id: book._id,
      order_item_id: orderItemId,
      type: 'own',
      status: 'active',
      expires_at: null,
      created_at: now,
    })

    const publisher = await publishers.findOne({ _id: book.publisher_id })
    const revenueShare = publisher?.revenue_share ?? 0.70
    const gateway_fee = paymentMethod === 'coin' ? 0 : Math.round(gross * 0.015)
    const net = gross - gateway_fee
    const publisher_share = Math.round(net * revenueShare)
    const platform_cut = net - publisher_share

    await revSplits.insertOne({
      _id: new ObjectId(),
      order_item_id: orderItemId,
      gross,
      gateway_fee,
      net,
      platform_cut,
      publisher_share,
      publisher_id: book.publisher_id,
      created_at: now,
    })
  }

  // Coin: create wallet_transaction for spend
  if (paymentMethod === 'coin') {
    const wallets = await getWallets()
    const wallet = await wallets.findOne({ user_id: userId })
    if (wallet) {
      const walletTxns = await getWalletTransactions()
      await walletTxns.insertOne({
        _id: new ObjectId(),
        wallet_id: wallet._id,
        type: 'spend',
        amount: -total,
        balance_after: wallet.balance,
        ref_type: 'order',
        ref_id: orderId,
        created_at: now,
      })
    }
  }

  // Clear cart items
  await cartItemsColl.deleteMany({ cart_id: cart._id })

  return NextResponse.json(
    {
      orderId: orderId.toString(),
      count: cartItems.length,
      amount: total,
    },
    { status: 201 }
  )
}
