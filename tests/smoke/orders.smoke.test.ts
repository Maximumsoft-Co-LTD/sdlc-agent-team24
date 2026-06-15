import { apiCall } from './setup'

// Uses the seeded reader account (created by /api/v1/seed)
const readerEmail = 'reader@read24.com'
const readerPassword = 'Reader1234!'

describe('Order & Payment flows (FR-5, FR-6, FR-8, FR-10)', () => {
  let accessToken: string
  let buyableBookId: string
  let rentableBookId: string

  beforeAll(async () => {
    const { data } = await apiCall('POST', '/auth/login', {
      email: readerEmail,
      password: readerPassword,
    })
    accessToken = data.accessToken as string

    const { data: booksData } = await apiCall('GET', '/books?limit=20')
    const books = (booksData.items as Array<Record<string, unknown>>) ?? []
    // Find a book for buy
    buyableBookId = books[0]?._id as string
    // Find a distinct book that has a rent price
    const rentable = books.find((b) => b.price_rent !== null && b._id !== buyableBookId)
    rentableBookId = (rentable?._id as string) ?? ''
  })

  test('unauthenticated POST /orders returns 401', async () => {
    if (!buyableBookId) return
    const { status } = await apiCall('POST', '/orders', {
      bookId: buyableBookId,
      type: 'buy',
      paymentMethod: 'mock',
    })
    expect(status).toBe(401)
  })

  test('buy book with mock payment returns 201 or 409 if already owned (FR-5)', async () => {
    if (!buyableBookId) return
    const { status, data } = await apiCall(
      'POST',
      '/orders',
      { bookId: buyableBookId, type: 'buy', paymentMethod: 'mock' },
      accessToken
    )
    // 201 = first purchase; 409 = seed already owns this book
    expect([201, 409]).toContain(status)
    if (status === 201) {
      expect(data.orderId).toBeTruthy()
      expect(data.entitlementId).toBeTruthy()
    }
  })

  test('duplicate purchase returns 409 DUPLICATE_ENTITLEMENT (FR-8)', async () => {
    if (!buyableBookId) return
    // Attempt a second buy of the same book (either previously owned or just bought above)
    const { status, data } = await apiCall(
      'POST',
      '/orders',
      { bookId: buyableBookId, type: 'buy', paymentMethod: 'mock' },
      accessToken
    )
    expect(status).toBe(409)
    expect(data.error).toBe('DUPLICATE_ENTITLEMENT')
  })

  test('rent book returns 201 or 409 if already renting (FR-6)', async () => {
    if (!rentableBookId) return
    const { status, data } = await apiCall(
      'POST',
      '/orders',
      { bookId: rentableBookId, type: 'rent', paymentMethod: 'mock' },
      accessToken
    )
    expect([201, 409]).toContain(status)
    if (status === 201) {
      expect(data.orderId).toBeTruthy()
      expect(data.entitlementId).toBeTruthy()
    }
  })

  test('rent a book with no price_rent available returns 400 RENT_NOT_AVAILABLE', async () => {
    // Find a book that has no rent price
    const { data: booksData } = await apiCall('GET', '/books?limit=50')
    const books = (booksData.items as Array<Record<string, unknown>>) ?? []
    const noRentBook = books.find((b) => b.price_rent === null)
    if (!noRentBook) return // skip if all books have rent price

    const { status, data } = await apiCall(
      'POST',
      '/orders',
      { bookId: noRentBook._id, type: 'rent', paymentMethod: 'mock' },
      accessToken
    )
    expect(status).toBe(400)
    expect(data.error).toBe('RENT_NOT_AVAILABLE')
  })

  test('order with invalid type returns 400 INVALID_TYPE', async () => {
    if (!buyableBookId) return
    const { status, data } = await apiCall(
      'POST',
      '/orders',
      { bookId: buyableBookId, type: 'gift', paymentMethod: 'mock' },
      accessToken
    )
    expect(status).toBe(400)
    expect(data.error).toBe('INVALID_TYPE')
  })

  test('order with invalid payment method returns 400', async () => {
    if (!buyableBookId) return
    const { status, data } = await apiCall(
      'POST',
      '/orders',
      { bookId: buyableBookId, type: 'buy', paymentMethod: 'stripe' },
      accessToken
    )
    expect(status).toBe(400)
    expect(data.error).toBe('INVALID_PAYMENT_METHOD')
  })

  test('GET /me/library returns owned/renting/expired arrays (FR-10)', async () => {
    const { status, data } = await apiCall('GET', '/me/library', undefined, accessToken)
    expect(status).toBe(200)
    expect(Array.isArray(data.owned)).toBe(true)
    expect(Array.isArray(data.renting)).toBe(true)
    expect(Array.isArray(data.expired)).toBe(true)
  })

  test('GET /me/library does not expose epub_key in book data (FR-10, security)', async () => {
    const { status, data } = await apiCall('GET', '/me/library', undefined, accessToken)
    expect(status).toBe(200)
    const allItems = [
      ...(data.owned as Array<Record<string, unknown>>),
      ...(data.renting as Array<Record<string, unknown>>),
      ...(data.expired as Array<Record<string, unknown>>),
    ]
    allItems.forEach((item) => {
      const book = item.book as Record<string, unknown>
      expect(book?.epub_key).toBeUndefined()
    })
  })

  test('GET /me/library unauthenticated returns 401', async () => {
    const { status } = await apiCall('GET', '/me/library')
    expect(status).toBe(401)
  })
})
