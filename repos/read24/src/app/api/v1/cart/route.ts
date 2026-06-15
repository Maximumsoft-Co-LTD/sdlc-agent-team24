import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCarts, getCartItems, getBooks } from '@/lib/db/collections'
import { verifyToken } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  let tokenPayload
  try {
    tokenPayload = await verifyToken(request)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = new ObjectId(tokenPayload.userId)
  const carts = await getCarts()

  // Find or create cart
  const now = new Date()
  let cart = await carts.findOne({ user_id: userId })
  if (!cart) {
    const cartId = new ObjectId()
    await carts.insertOne({ _id: cartId, user_id: userId, updated_at: now })
    cart = await carts.findOne({ _id: cartId })
  }

  const cartItems = await getCartItems()
  const items = await cartItems.find({ cart_id: cart!._id }).toArray()

  const books = await getBooks()
  const enriched = await Promise.all(
    items.map(async (item) => {
      const book = await books.findOne(
        { _id: item.book_id },
        { projection: { epub_key: 0 } }
      )
      return {
        cartItemId: item._id.toString(),
        book: book
          ? {
              ...book,
              _id: book._id.toString(),
              publisher_id: book.publisher_id.toString(),
            }
          : null,
        price: book?.price_buy ?? 0,
      }
    })
  )

  const valid = enriched.filter((i) => i.book !== null)
  const total = valid.reduce((sum, i) => sum + i.price, 0)

  return NextResponse.json({
    items: valid,
    total,
    count: valid.length,
  })
}
