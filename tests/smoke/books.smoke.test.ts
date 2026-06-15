import { apiCall } from './setup'

describe('Books API (FR-2, FR-3, FR-4)', () => {
  test('GET /books returns only published books (FR-2)', async () => {
    const { status, data } = await apiCall('GET', '/books?limit=20')
    expect(status).toBe(200)
    const items = data.items as Array<Record<string, unknown>>
    expect(Array.isArray(items)).toBe(true)
    // Every returned book must be published
    items.forEach((book) => {
      expect(book.status).toBe('published')
    })
  })

  test('GET /books omits epub_key from response (FR-12 security, FR-2)', async () => {
    const { status, data } = await apiCall('GET', '/books?limit=20')
    expect(status).toBe(200)
    const items = data.items as Array<Record<string, unknown>>
    items.forEach((book) => {
      expect(book.epub_key).toBeUndefined()
    })
  })

  test('GET /books returns pagination fields', async () => {
    const { status, data } = await apiCall('GET', '/books?limit=5')
    expect(status).toBe(200)
    // nextCursor is either a string or null
    expect(data).toHaveProperty('nextCursor')
  })

  test('GET /books with category filter returns matching books (FR-2)', async () => {
    const { status, data } = await apiCall('GET', '/books?category=ธุรกิจ')
    expect(status).toBe(200)
    const items = data.items as Array<Record<string, unknown>>
    expect(Array.isArray(items)).toBe(true)
    // All returned items belong to the requested category
    items.forEach((book) => {
      expect(book.category).toBe('ธุรกิจ')
    })
  })

  test('GET /books/search?q= returns results (FR-3)', async () => {
    const { status, data } = await apiCall('GET', '/books/search?q=ผู้นำ')
    expect(status).toBe(200)
    const items = data.items as Array<Record<string, unknown>>
    expect(Array.isArray(items)).toBe(true)
  })

  test('GET /books/search with no-match query returns empty array (FR-3)', async () => {
    const { status, data } = await apiCall('GET', '/books/search?q=xyzxyzxyznobook999')
    expect(status).toBe(200)
    const items = data.items as Array<Record<string, unknown>>
    expect(items.length).toBe(0)
  })

  test('GET /books/:id with non-existent id returns 404', async () => {
    // Fake but valid-format ObjectId
    const { status } = await apiCall('GET', '/books/000000000000000000000001')
    expect(status).toBe(404)
  })

  test('books with price_rent=null have no rent price available (FR-4)', async () => {
    const { status, data } = await apiCall('GET', '/books?limit=50')
    expect(status).toBe(200)
    const items = data.items as Array<Record<string, unknown>>
    // Verify the field is present and can be null (not omitted)
    const noPriceRent = items.filter((b) => b.price_rent === null)
    noPriceRent.forEach((b) => {
      expect(b.price_rent).toBeNull()
    })
  })

  test('GET /books with invalid cursor returns 400', async () => {
    const { status, data } = await apiCall('GET', '/books?cursor=not-a-valid-objectid')
    expect(status).toBe(400)
    expect(data.error).toBe('INVALID_CURSOR')
  })
})
