import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getUsers, getWallets } from '@/lib/db/collections'
import { verifyToken } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  let tokenPayload
  try {
    tokenPayload = await verifyToken(request)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = new ObjectId(tokenPayload.userId)

  const users = await getUsers()
  const user = await users.findOne({ _id: userId }, { projection: { password_hash: 0 } })
  if (!user) {
    return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 })
  }

  const wallets = await getWallets()
  const wallet = await wallets.findOne({ user_id: userId })

  return NextResponse.json({
    id: user._id.toString(),
    email: user.email,
    displayName: user.display_name,
    role: user.role,
    balance: wallet?.balance ?? 0,
  })
}

export async function PATCH() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
