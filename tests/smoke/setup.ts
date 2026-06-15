import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:password@localhost:27017/read24?authSource=admin'

export let client: MongoClient
export const BASE_URL = process.env.APP_URL || 'http://localhost:3000'

export async function connectDb() {
  client = new MongoClient(MONGODB_URI)
  await client.connect()
  return client.db()
}

export async function closeDb() {
  await client?.close()
}

export async function apiCall(method: string, path: string, body?: unknown, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })

  const text = await res.text()
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    data = { _raw: text }
  }

  return { status: res.status, data: data as Record<string, unknown>, headers: res.headers }
}
