import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { signAccessToken } from '@/lib/auth'

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET || `${process.env.JWT_SECRET}-refresh`
)

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken')?.value

  if (!refreshToken) {
    return NextResponse.json({ error: 'NO_REFRESH_TOKEN' }, { status: 401 })
  }

  let payload: { userId: string; role: string; publisherId?: string }
  try {
    const { payload: decoded } = await jwtVerify(refreshToken, REFRESH_SECRET)
    payload = decoded as { userId: string; role: string; publisherId?: string }
  } catch {
    return NextResponse.json({ error: 'INVALID_REFRESH_TOKEN' }, { status: 401 })
  }

  const accessToken = await signAccessToken({
    userId: payload.userId,
    role: payload.role,
    publisherId: payload.publisherId,
  })

  return NextResponse.json({ accessToken })
}
