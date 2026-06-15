import argon2 from 'argon2'
import { ObjectId } from 'mongodb'
import { getPublishers, getUsers, getCoinPackages, getWallets } from './collections'
import { createAllIndexes } from './indexes'

export async function seedDatabase() {
  await createAllIndexes()

  // Coin packages
  const packages = [
    { coins: 50, bonus: 0, price_thb: 29, active: true },
    { coins: 100, bonus: 0, price_thb: 49, active: true },
    { coins: 300, bonus: 15, price_thb: 99, active: true },
    { coins: 500, bonus: 40, price_thb: 149, active: true },
    { coins: 1000, bonus: 120, price_thb: 299, active: true },
  ]
  const pkgColl = await getCoinPackages()
  for (const pkg of packages) {
    await pkgColl.updateOne(
      { coins: pkg.coins, price_thb: pkg.price_thb },
      { $setOnInsert: { ...pkg, _id: new ObjectId() } },
      { upsert: true }
    )
  }

  // Publisher
  const pubColl = await getPublishers()
  const publisher = await pubColl.findOneAndUpdate(
    { name: 'สำนักพิมพ์ดีดี' },
    {
      $setOnInsert: {
        _id: new ObjectId(),
        name: 'สำนักพิมพ์ดีดี',
        revenue_share: 0.70,
        is_exclusive_default: false,
        contract_ref: 'DEMO-001',
        territory: 'TH',
        created_at: new Date(),
      },
    },
    { upsert: true, returnDocument: 'after' }
  )
  const publisherId = publisher!._id

  // Demo accounts
  const userColl = await getUsers()
  const walletColl = await getWallets()

  const accounts = [
    { email: 'admin@read24.com', password: 'Admin1234!', display_name: 'Admin', role: 'admin' as const, publisher_id: null as ObjectId | null },
    { email: 'publisher@read24.com', password: 'Pub1234!', display_name: 'Publisher Demo', role: 'publisher' as const, publisher_id: publisherId },
    { email: 'reader@read24.com', password: 'Reader1234!', display_name: 'Reader Demo', role: 'reader' as const, publisher_id: null as ObjectId | null },
  ]

  for (const acc of accounts) {
    const password_hash = await argon2.hash(acc.password)
    const result = await userColl.findOneAndUpdate(
      { email: acc.email },
      {
        $setOnInsert: {
          _id: new ObjectId(),
          email: acc.email,
          password_hash,
          display_name: acc.display_name,
          role: acc.role,
          publisher_id: acc.publisher_id,
          created_at: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after' }
    )
    const userId = result!._id
    await walletColl.updateOne(
      { user_id: userId },
      { $setOnInsert: { _id: new ObjectId(), user_id: userId, balance: 0, updated_at: new Date() } },
      { upsert: true }
    )
  }

  return { ok: true, message: 'Seed complete' }
}
