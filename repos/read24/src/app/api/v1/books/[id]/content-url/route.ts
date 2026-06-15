import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { s3Client, BUCKET } from '@/lib/minio'
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

  const command = new GetObjectCommand({ Bucket: BUCKET, Key: book.epub_key })
  const url = await getSignedUrl(s3Client, command, { expiresIn: 900 })

  return NextResponse.json({ url, expiresIn: 900 })
}
