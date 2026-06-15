import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getOrders, getOrderItems } from '@/lib/db/collections'
import { verifyToken } from '@/lib/middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let tokenPayload
  try {
    tokenPayload = await verifyToken(request)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let orderId: ObjectId
  try {
    orderId = new ObjectId(params.id)
  } catch {
    return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })
  }

  const userId = new ObjectId(tokenPayload.userId)
  const orders = await getOrders()
  const order = await orders.findOne({ _id: orderId, user_id: userId })

  if (!order) {
    return NextResponse.json({ error: 'ORDER_NOT_FOUND' }, { status: 404 })
  }

  const orderItems = await getOrderItems()
  const items = await orderItems.find({ order_id: orderId }).toArray()

  return NextResponse.json({
    order: {
      ...order,
      _id: order._id.toString(),
      user_id: order.user_id.toString(),
    },
    items: items.map((i) => ({
      ...i,
      _id: i._id.toString(),
      order_id: i.order_id.toString(),
      book_id: i.book_id.toString(),
    })),
  })
}
