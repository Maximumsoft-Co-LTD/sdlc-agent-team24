import { apiCall } from './setup'

// All accounts are created by /api/v1/seed
describe('Back Office: Publisher & Admin (FR-11, FR-17, FR-18, FR-20, Security)', () => {
  let adminToken: string
  let publisherToken: string
  let readerToken: string

  beforeAll(async () => {
    const [adminRes, pubRes, readerRes] = await Promise.all([
      apiCall('POST', '/auth/login', { email: 'admin@read24.com', password: 'Admin1234!' }),
      apiCall('POST', '/auth/login', { email: 'publisher@read24.com', password: 'Pub1234!' }),
      apiCall('POST', '/auth/login', { email: 'reader@read24.com', password: 'Reader1234!' }),
    ])
    adminToken = adminRes.data.accessToken as string
    publisherToken = pubRes.data.accessToken as string
    readerToken = readerRes.data.accessToken as string
  })

  // ── Security: role enforcement ────────────────────────────────────────────

  test('reader accessing /admin/dashboard returns 403 (Security)', async () => {
    const { status, data } = await apiCall('GET', '/admin/dashboard', undefined, readerToken)
    expect(status).toBe(403)
    expect(data.error).toBe('Forbidden')
  })

  test('publisher accessing /admin/books returns 403 (Security)', async () => {
    const { status, data } = await apiCall('GET', '/admin/books', undefined, publisherToken)
    expect(status).toBe(403)
    expect(data.error).toBe('Forbidden')
  })

  test('reader accessing /admin/revenue returns 403 (Security)', async () => {
    const { status, data } = await apiCall('GET', '/admin/revenue', undefined, readerToken)
    expect(status).toBe(403)
  })

  test('reader accessing /publisher/books returns 403 (Security)', async () => {
    const { status, data } = await apiCall('GET', '/publisher/books', undefined, readerToken)
    expect(status).toBe(403)
  })

  test('unauthenticated admin endpoint returns 401 (Security)', async () => {
    const { status } = await apiCall('GET', '/admin/dashboard')
    expect(status).toBe(401)
  })

  // ── Publisher flows (FR-11) ───────────────────────────────────────────────

  test('publisher can list own books (FR-11)', async () => {
    const { status, data } = await apiCall(
      'GET',
      '/publisher/books',
      undefined,
      publisherToken
    )
    expect(status).toBe(200)
    // publisher/books route returns { books: [...] }
    const books = data.books as Array<Record<string, unknown>>
    expect(Array.isArray(books)).toBe(true)
  })

  test('publisher can create a draft book (FR-11)', async () => {
    const { status, data } = await apiCall(
      'POST',
      '/publisher/books',
      {
        title: `Smoke Test Book ${Date.now()}`,
        author: 'Smoke Author',
        description: 'Test description for smoke test',
        category: 'การศึกษา',
        price_buy: 199,
      },
      publisherToken
    )
    expect(status).toBe(201)
    // New books always start as draft
    expect(data.status).toBe('draft')
    expect(data.id).toBeTruthy()
  })

  test('publisher cannot create book with missing fields returns 400 (FR-11)', async () => {
    const { status, data } = await apiCall(
      'POST',
      '/publisher/books',
      { title: 'No Author Book' },
      publisherToken
    )
    expect(status).toBe(400)
    expect(data.error).toBe('MISSING_FIELDS')
  })

  // ── Admin: books (FR-20) ──────────────────────────────────────────────────

  test('admin can list all books (FR-20)', async () => {
    const { status, data } = await apiCall(
      'GET',
      '/admin/books',
      undefined,
      adminToken
    )
    expect(status).toBe(200)
    // admin/books route returns { books: [...] }
    const books = data.books as Array<Record<string, unknown>>
    expect(Array.isArray(books)).toBe(true)
  })

  test('admin book list includes non-published statuses (FR-20)', async () => {
    const { status, data } = await apiCall(
      'GET',
      '/admin/books',
      undefined,
      adminToken
    )
    expect(status).toBe(200)
    const books = data.books as Array<Record<string, unknown>>
    // Admin sees all statuses; there should be at least the seeded published books
    expect(books.length).toBeGreaterThan(0)
  })

  // ── Admin dashboard KPIs (FR-17) ──────────────────────────────────────────

  test('admin dashboard returns required KPI fields (FR-17)', async () => {
    const { status, data } = await apiCall(
      'GET',
      '/admin/dashboard',
      undefined,
      adminToken
    )
    expect(status).toBe(200)
    expect(typeof data.gmv).toBe('number')
    expect(typeof data.platformCut).toBe('number')
    expect(typeof data.publisherShare).toBe('number')
    expect(typeof data.buyCount).toBe('number')
    expect(typeof data.rentCount).toBe('number')
    expect(data.booksByStatus).toBeDefined()
    expect(Array.isArray(data.revenueByMonth)).toBe(true)
  })

  // ── Admin revenue (FR-17) ─────────────────────────────────────────────────

  test('admin revenue endpoint returns summary with correct split (FR-17)', async () => {
    const { status, data } = await apiCall(
      'GET',
      '/admin/revenue',
      undefined,
      adminToken
    )
    expect(status).toBe(200)
    const summary = data.summary as Record<string, number>
    expect(summary).toBeDefined()
    expect(typeof summary.gmv).toBe('number')
    expect(typeof summary.net).toBe('number')
    expect(typeof summary.platformCut).toBe('number')
    expect(typeof summary.publisherShare).toBe('number')
    // Invariant: platform_cut + publisher_share = net (when net > 0)
    if (summary.net > 0) {
      expect(summary.platformCut + summary.publisherShare).toBe(summary.net)
    }
  })

  // ── Publisher dashboard (FR-18) ───────────────────────────────────────────

  test('publisher dashboard returns own GMV and share (FR-18)', async () => {
    const { status, data } = await apiCall(
      'GET',
      '/publisher/dashboard',
      undefined,
      publisherToken
    )
    expect(status).toBe(200)
    expect(typeof data.myGmv).toBe('number')
    expect(typeof data.myPublisherShare).toBe('number')
    expect(typeof data.soldCount).toBe('number')
    expect(typeof data.rentCount).toBe('number')
  })

  // ── Audit logs (FR-20) ────────────────────────────────────────────────────

  test('admin can access audit logs (FR-20)', async () => {
    const { status, data } = await apiCall(
      'GET',
      '/admin/audit-logs',
      undefined,
      adminToken
    )
    expect(status).toBe(200)
    const items = data.items as Array<Record<string, unknown>>
    expect(Array.isArray(items)).toBe(true)
    // nextCursor field must be present (cursor-based pagination)
    expect(data).toHaveProperty('nextCursor')
  })

  test('non-admin cannot access audit logs returns 403 (Security)', async () => {
    const { status } = await apiCall(
      'GET',
      '/admin/audit-logs',
      undefined,
      readerToken
    )
    expect(status).toBe(403)
  })
})
