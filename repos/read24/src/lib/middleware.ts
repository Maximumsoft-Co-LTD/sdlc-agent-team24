import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export interface TokenPayload {
  userId: string
  role: string
  publisherId?: string
}

/**
 * Extracts and verifies the Bearer token from a request.
 * Returns the decoded payload or throws if missing / invalid.
 */
export async function verifyToken(request: NextRequest): Promise<TokenPayload> {
  const token =
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    request.cookies.get('accessToken')?.value

  if (!token) {
    throw new Error('No token provided')
  }

  const { payload } = await jwtVerify(token, JWT_SECRET)
  return payload as TokenPayload
}
