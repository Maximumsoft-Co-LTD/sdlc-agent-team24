import { NextResponse } from 'next/server'
import { seedDatabase } from '@/lib/db/seed'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const result = await seedDatabase()
    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Seed failed', details: message }, { status: 500 })
  }
}
