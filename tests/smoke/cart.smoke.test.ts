import { apiCall } from './setup'

describe('Cart & Checkout (FR-19)', () => {
  let accessToken: string
  let bookId: string

  beforeAll(async () => {
    // Fresh user per test run to avoid cross-run cart state
    const email = `cart-smoke-${Date.now()}@test.com`
    await apiCall('POST', '/auth/register', {
      email,
      password: 'Smoke1234!',
      displayName: 'Cart Test',
    })
    const { data } = await apiCall('POST', '/auth/login', {
      email,
      password: 'Smoke1234!',
    })
    accessToken = data.accessToken as string

    const { data: booksData } = await apiCall('GET', '/books?limit=5')
    const books = (booksData.items as Array<Record<string, unknown>>) ?? []
    bookId = books[0]?._id as string
  })

  test('GET /cart unauthenticated returns 401', async () => {
    const { status } = await apiCall('GET', '/cart')
    expect(status).toBe(401)
  })

  test('GET /cart returns empty cart for new user', async () => {
    const { status, data } = await apiCall('GET', '/cart', undefined, accessToken)
    expect(status).toBe(200)
    expect(data.count).toBe(0)
    const items = data.items as unknown[]
    expect(items).toHaveLength(0)
    expect(data.total).toBe(0)
  })

  test('POST /cart/items adds a published book (FR-19)', async () => {
    if (!bookId) return
    const { status, data } = await apiCall(
      'POST',
      '/cart/items',
      { bookId },
      accessToken
    )
    expect(status).toBe(201)
    expect(data.cartItemId).toBeTruthy()
  })

  test('POST /cart/items duplicate book returns 409 DUPLICATE (FR-19)', async () => {
    if (!bookId) return
    const { status, data } = await apiCall(
      'POST',
      '/cart/items',
      { bookId },
      accessToken
    )
    expect(status).toBe(409)
    // Actual error code from cart/items route is 'DUPLICATE'
    expect(data.error).toBe('DUPLICATE')
  })

  test('GET /cart shows item count, total, and no epub_key in book data', async () => {
    const { status, data } = await apiCall('GET', '/cart', undefined, accessToken)
    expect(status).toBe(200)
    expect(data.count).toBe(1)
    expect((data.total as number)).toBeGreaterThan(0)
    const items = data.items as Array<Record<string, unknown>>
    items.forEach((item) => {
      const book = item.book as Record<string, unknown>
      expect(book?.epub_key).toBeUndefined()
    })
  })

  test('DELETE /cart/items/:bookId removes the item and cart becomes empty', async () => {
    if (!bookId) return
    const { status } = await apiCall(
      'DELETE',
      `/cart/items/${bookId}`,
      undefined,
      accessToken
    )
    expect(status).toBe(204)

    const { data } = await apiCall('GET', '/cart', undefined, accessToken)
    expect(data.count).toBe(0)
  })

  test('POST /cart/checkout with empty cart returns 400 CART_EMPTY', async () => {
    // Cart was just emptied by the DELETE test above
    const { status, data } = await apiCall(
      'POST',
      '/cart/checkout',
      { paymentMethod: 'mock' },
      accessToken
    )
    expect(status).toBe(400)
    expect(data.error).toBe('CART_EMPTY')
  })

  test('POST /cart/checkout mock payment creates order and clears cart (FR-19)', async () => {
    if (!bookId) return
    // Re-add the book first
    await apiCall('POST', '/cart/items', { bookId }, accessToken)

    const { status, data } = await apiCall(
      'POST',
      '/cart/checkout',
      { paymentMethod: 'mock' },
      accessToken
    )
    expect(status).toBe(201)
    expect(data.orderId).toBeTruthy()
    expect(data.count).toBe(1)
    expect((data.amount as number)).toBeGreaterThan(0)

    // Cart should now be empty
    const { data: cartData } = await apiCall('GET', '/cart', undefined, accessToken)
    expect(cartData.count).toBe(0)
  })

  test('POST /cart/items with non-published bookId returns 404', async () => {
    const { status, data } = await apiCall(
      'POST',
      '/cart/items',
      { bookId: '000000000000000000000001' },
      accessToken
    )
    expect(status).toBe(404)
    expect(data.error).toBe('BOOK_NOT_FOUND')
  })
})
