import { NextResponse } from 'next/server'
import { getCoinPackages } from '@/lib/db/collections'

export async function GET() {
  const pkgs = await getCoinPackages()
  const items = await pkgs
    .find({ active: true }, { sort: { price_thb: 1 } })
    .toArray()

  return NextResponse.json({
    items: items.map((p) => ({
      ...p,
      _id: p._id.toString(),
    })),
  })
}
