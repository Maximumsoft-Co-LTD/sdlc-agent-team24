import { NextRequest, NextResponse } from 'next/server'
import argon2 from 'argon2'
import { SignJWT } from 'jose'
import { getUsers } from '@/lib/db/collections'
import { signAccessToken } from '@/lib/auth'

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET || `${process.env.JWT_SECRET}-refresh`
)

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const { email, password } = body as Record<string, string>

  if (!email || !password) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 })
  }

  const users = await getUsers()
  const user = await users.findOne({ email: email.toLowerCase() })
  if (!user) {
    return NextResponse.json({ error: 'INVALID_CREDENTIALS' }, { status: 401 })
  }

  let passwordValid = false
  try {
    passwordValid = await argon2.verify(user.password_hash, password)
  } catch {
    return NextResponse.json({ error: 'INVALID_CREDENTIALS' }, { status: 401 })
  }

  if (!passwordValid) {
    return NextResponse.json({ error: 'INVALID_CREDENTIALS' }, { status: 401 })
  }

  const accessToken = await signAccessToken({
    userId: user._id.toString(),
    role: user.role,
    publisherId: user.publisher_id?.toString(),
  })

  const refreshToken = await new SignJWT({
    userId: user._id.toString(),
    role: user.role,
    publisherId: user.publisher_id?.toString(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(REFRESH_SECRET)

  const response = NextResponse.json({
    accessToken,
    user: {
      id: user._id.toString(),
      email: user.email,
      displayName: user.display_name,
      role: user.role,
    },
  })

  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
  })

  return response
}
