import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getEntitlements, getBooks } from '@/lib/db/collections'
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

  let bookId: ObjectId
  try {
    bookId = new ObjectId(params.id)
  } catch {
    return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })
  }

  const userId = new ObjectId(tokenPayload.userId)
  const now = new Date()

  const entitlements = await getEntitlements()
  const entitlement = await entitlements.findOne({
    user_id: userId,
    book_id: bookId,
    status: 'active',
  })

  if (!entitlement) {
    return NextResponse.json({ error: 'NO_ENTITLEMENT' }, { status: 403 })
  }

  // Lazy expiry check for rental
  if (entitlement.expires_at && entitlement.expires_at <= now) {
    await entitlements.updateOne(
      { _id: entitlement._id },
      { $set: { status: 'expired' } }
    )
    return NextResponse.json({ error: 'EXPIRED_ENTITLEMENT' }, { status: 403 })
  }

  const books = await getBooks()
  const book = await books.findOne({ _id: bookId })
  if (!book || !book.epub_key) {
    return NextResponse.json({ error: 'BOOK_NOT_FOUND' }, { status: 404 })
  }

  // Return a same-origin proxy URL so epub.js doesn't hit MinIO directly (avoids CORS)
  const rawToken = request.headers.get('authorization')?.replace('Bearer ', '') ?? ''
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const url = `${base}/api/v1/books/${params.id}/epub?token=${encodeURIComponent(rawToken)}`

  return NextResponse.json({ url, expiresIn: 900 })
}
