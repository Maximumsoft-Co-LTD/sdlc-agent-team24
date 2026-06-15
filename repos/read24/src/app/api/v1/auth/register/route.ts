import { NextRequest, NextResponse } from 'next/server'
import argon2 from 'argon2'
import { ObjectId } from 'mongodb'
import { getUsers, getWallets } from '@/lib/db/collections'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const { email, password, displayName } = body as Record<string, string>

  if (!email || !password || !displayName) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'INVALID_EMAIL' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'PASSWORD_TOO_SHORT' }, { status: 400 })
  }

  const users = await getUsers()
  const existing = await users.findOne({ email: email.toLowerCase() })
  if (existing) {
    return NextResponse.json({ error: 'EMAIL_TAKEN' }, { status: 409 })
  }

  const password_hash = await argon2.hash(password)
  const userId = new ObjectId()
  await users.insertOne({
    _id: userId,
    email: email.toLowerCase(),
    password_hash,
    display_name: displayName,
    role: 'reader',
    publisher_id: null,
    created_at: new Date(),
  })

  // Create wallet for new user
  const wallets = await getWallets()
  await wallets.insertOne({
    _id: new ObjectId(),
    user_id: userId,
    balance: 0,
    updated_at: new Date(),
  })

  return NextResponse.json(
    { userId: userId.toString(), email: email.toLowerCase(), role: 'reader' },
    { status: 201 }
  )
}
