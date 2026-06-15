import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCarts, getCartItems } from '@/lib/db/collections'
import { verifyToken } from '@/lib/middleware'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  let tokenPayload
  try {
    tokenPayload = await verifyToken(request)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let bookObjId: ObjectId
  try {
    bookObjId = new ObjectId(params.bookId)
  } catch {
    return NextResponse.json({ error: 'INVALID_BOOK_ID' }, { status: 400 })
  }

  const userId = new ObjectId(tokenPayload.userId)
  const carts = await getCarts()
  const cart = await carts.findOne({ user_id: userId })
  if (!cart) {
    return NextResponse.json({ error: 'CART_NOT_FOUND' }, { status: 404 })
  }

  const cartItems = await getCartItems()
  const result = await cartItems.deleteOne({ cart_id: cart._id, book_id: bookObjId })
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'ITEM_NOT_FOUND' }, { status: 404 })
  }

  return new NextResponse(null, { status: 204 })
}
