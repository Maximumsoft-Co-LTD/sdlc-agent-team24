import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCarts, getCartItems, getBooks } from '@/lib/db/collections'
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

  const { bookId } = body as Record<string, string>
  if (!bookId) {
    return NextResponse.json({ error: 'MISSING_BOOK_ID' }, { status: 400 })
  }

  let bookObjId: ObjectId
  try {
    bookObjId = new ObjectId(bookId)
  } catch {
    return NextResponse.json({ error: 'INVALID_BOOK_ID' }, { status: 400 })
  }

  // Verify book is published
  const books = await getBooks()
  const book = await books.findOne({ _id: bookObjId, status: 'published' })
  if (!book) {
    return NextResponse.json({ error: 'BOOK_NOT_FOUND' }, { status: 404 })
  }

  const userId = new ObjectId(tokenPayload.userId)
  const carts = await getCarts()
  const now = new Date()

  // Find or create cart
  let cart = await carts.findOne({ user_id: userId })
  if (!cart) {
    const cartId = new ObjectId()
    await carts.insertOne({ _id: cartId, user_id: userId, updated_at: now })
    cart = await carts.findOne({ _id: cartId })
  }

  const cartItems = await getCartItems()

  // Check for duplicate
  const existing = await cartItems.findOne({ cart_id: cart!._id, book_id: bookObjId })
  if (existing) {
    return NextResponse.json({ error: 'DUPLICATE' }, { status: 409 })
  }

  const cartItemId = new ObjectId()
  await cartItems.insertOne({
    _id: cartItemId,
    cart_id: cart!._id,
    book_id: bookObjId,
    added_at: now,
  })

  // Update cart timestamp
  await carts.updateOne({ _id: cart!._id }, { $set: { updated_at: now } })

  return NextResponse.json({ cartItemId: cartItemId.toString() }, { status: 201 })
}
