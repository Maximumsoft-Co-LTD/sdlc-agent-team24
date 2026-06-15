const BASE = '/api/v1'

export async function apiGet(path: string, token?: string | null) {
  const headers: HeadersInit = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { headers, credentials: 'include' })
  return res
}

export async function apiPost(path: string, body: unknown, token?: string | null) {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(body),
  })
}

export async function apiPut(path: string, body: unknown, token?: string | null) {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers,
    credentials: 'include',
    body: JSON.stringify(body),
  })
}

export async function apiDelete(path: string, token?: string | null) {
  const headers: HeadersInit = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  return fetch(`${BASE}${path}`, { method: 'DELETE', headers, credentials: 'include' })
}
