import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getReadingProgress } from '@/lib/db/collections'
import { verifyToken } from '@/lib/middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  let tokenPayload
  try {
    tokenPayload = await verifyToken(request)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let bookId: ObjectId
  try {
    bookId = new ObjectId(params.bookId)
  } catch {
    return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })
  }

  const userId = new ObjectId(tokenPayload.userId)
  const progressColl = await getReadingProgress()
  const progress = await progressColl.findOne({ user_id: userId, book_id: bookId })

  if (!progress) {
    return NextResponse.json({})
  }

  return NextResponse.json({
    cfi: progress.cfi,
    percent: progress.percent,
    updatedAt: progress.updated_at,
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  let tokenPayload
  try {
    tokenPayload = await verifyToken(request)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let bookId: ObjectId
  try {
    bookId = new ObjectId(params.bookId)
  } catch {
    return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const { cfi, percent } = body as { cfi?: string; percent?: number }

  if (cfi === undefined || percent === undefined) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 })
  }

  const userId = new ObjectId(tokenPayload.userId)
  const progressColl = await getReadingProgress()

  await progressColl.updateOne(
    { user_id: userId, book_id: bookId },
    {
      $set: { cfi, percent, updated_at: new Date() },
      $setOnInsert: { _id: new ObjectId(), user_id: userId, book_id: bookId },
    },
    { upsert: true }
  )

  return new NextResponse(null, { status: 204 })
}
