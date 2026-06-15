import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { s3Client, BUCKET } from '@/lib/minio'
import { getEntitlements, getBooks } from '@/lib/db/collections'
import { verifyAccessToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Accept token from query param (epub.js can't send custom headers)
  const token = request.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: { userId: string }
  try {
    payload = await verifyAccessToken(token) as { userId: string }
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let bookId: ObjectId
  try {
    bookId = new ObjectId(params.id)
  } catch {
    return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })
  }

  const userId = new ObjectId(payload.userId)
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

  if (entitlement.expires_at && entitlement.expires_at <= now) {
    await entitlements.updateOne({ _id: entitlement._id }, { $set: { status: 'expired' } })
    return NextResponse.json({ error: 'EXPIRED_ENTITLEMENT' }, { status: 403 })
  }

  const books = await getBooks()
  const book = await books.findOne({ _id: bookId })
  if (!book?.epub_key) {
    return NextResponse.json({ error: 'BOOK_NOT_FOUND' }, { status: 404 })
  }

  const command = new GetObjectCommand({ Bucket: BUCKET, Key: book.epub_key })
  const s3Response = await s3Client.send(command)

  if (!s3Response.Body) {
    return NextResponse.json({ error: 'FILE_NOT_FOUND' }, { status: 404 })
  }

  // Stream the epub back — same origin, no CORS needed
  const body = s3Response.Body as { transformToByteArray: () => Promise<Uint8Array> }
  const bytes = await body.transformToByteArray()

  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'application/epub+zip',
      'Content-Length': String(bytes.length),
      'Cache-Control': 'private, max-age=900',
    },
  })
}
