import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI!
let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In dev, use global to preserve connection across HMR
  const globalWithMongo = global as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> }
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export default clientPromise

export async function getDb(): Promise<Db> {
  const client = await clientPromise
  return client.db()
}
