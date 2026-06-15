import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getEntitlements, getBooks } from '@/lib/db/collections'
import { verifyToken } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  let tokenPayload
  try {
    tokenPayload = await verifyToken(request)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = new ObjectId(tokenPayload.userId)
  const entitlements = await getEntitlements()
  const now = new Date()

  // Lazily expire any overdue rents
  await entitlements.updateMany(
    { user_id: userId, type: 'rent', status: 'active', expires_at: { $lte: now } },
    { $set: { status: 'expired' } }
  )

  const allEntitlements = await entitlements.find({ user_id: userId }).toArray()

  const books = await getBooks()

  const owned: unknown[] = []
  const renting: unknown[] = []
  const expired: unknown[] = []

  for (const ent of allEntitlements) {
    const book = await books.findOne({ _id: ent.book_id }, { projection: { epub_key: 0 } })
    if (!book) continue

    const item = {
      entitlementId: ent._id.toString(),
      book: { ...book, _id: book._id.toString(), publisher_id: book.publisher_id?.toString() },
      type: ent.type,
      status: ent.status,
      expiresAt: ent.expires_at ?? null,
      daysLeft: ent.expires_at
        ? Math.ceil((ent.expires_at.getTime() - now.getTime()) / 86400000)
        : null,
    }

    if (ent.type === 'own' && ent.status === 'active') {
      owned.push(item)
    } else if (ent.type === 'rent' && ent.status === 'active') {
      renting.push(item)
    } else {
      expired.push(item)
    }
  }

  return NextResponse.json({ owned, renting, expired })
}
