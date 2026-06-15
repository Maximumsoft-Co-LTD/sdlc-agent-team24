import { apiCall } from './setup'

describe('Wallet & Coins (FR-13, FR-14, FR-15, FR-16)', () => {
  let accessToken: string
  let packageId: string
  let packageCoins: number
  let packageBonus: number

  beforeAll(async () => {
    // Fresh user to guarantee a clean wallet state
    const email = `wallet-smoke-${Date.now()}@test.com`
    await apiCall('POST', '/auth/register', {
      email,
      password: 'Smoke1234!',
      displayName: 'Wallet Test',
    })
    const { data } = await apiCall('POST', '/auth/login', {
      email,
      password: 'Smoke1234!',
    })
    accessToken = data.accessToken as string

    // Resolve the smallest coin package for use in topup tests
    const { data: pkgsData } = await apiCall('GET', '/coin-packages')
    const pkgs = pkgsData as Array<Record<string, unknown>>
    if (pkgs.length > 0) {
      const smallest = pkgs.reduce((a, b) =>
        (a.coins as number) <= (b.coins as number) ? a : b
      )
      packageId = smallest._id as string
      packageCoins = smallest.coins as number
      packageBonus = smallest.bonus as number
    }
  })

  test('GET /wallet returns balance=0 for new user (FR-13)', async () => {
    const { status, data } = await apiCall('GET', '/wallet', undefined, accessToken)
    expect(status).toBe(200)
    // API returns: { balance, userId }
    expect(data.balance).toBe(0)
    expect(data.userId).toBeTruthy()
  })

  test('GET /wallet unauthenticated returns 401', async () => {
    const { status } = await apiCall('GET', '/wallet')
    expect(status).toBe(401)
  })

  test('GET /coin-packages returns active packages with required fields', async () => {
    const { status, data } = await apiCall('GET', '/coin-packages')
    expect(status).toBe(200)
    const pkgs = data as Array<Record<string, unknown>>
    expect(Array.isArray(pkgs)).toBe(true)
    expect(pkgs.length).toBeGreaterThan(0)
    pkgs.forEach((pkg) => {
      expect(pkg.active).toBe(true)
      expect(typeof pkg.coins).toBe('number')
      expect((pkg.coins as number)).toBeGreaterThan(0)
      expect(typeof pkg.price_thb).toBe('number')
      expect((pkg.price_thb as number)).toBeGreaterThan(0)
    })
  })

  test('POST /wallet/topup with mock payment adds coins immediately (FR-14)', async () => {
    if (!packageId) return
    const { status, data } = await apiCall(
      'POST',
      '/wallet/topup',
      { packageId },
      accessToken
    )
    expect(status).toBe(201)
    // API returns: { topupId, coins, bonus, balance }
    expect(data.topupId).toBeTruthy()
    expect(data.coins).toBe(packageCoins)
    expect(data.bonus).toBe(packageBonus)
    // balance should equal coins + bonus (starting from 0)
    expect(data.balance).toBe(packageCoins + packageBonus)
  })

  test('GET /wallet/transactions shows ledger with balance_after (FR-16)', async () => {
    const { status, data } = await apiCall(
      'GET',
      '/wallet/transactions',
      undefined,
      accessToken
    )
    expect(status).toBe(200)
    const items = data.items as Array<Record<string, unknown>>
    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBeGreaterThan(0)
    // Each transaction must carry balance_after
    items.forEach((tx) => {
      expect(tx.balance_after).toBeDefined()
    })
  })

  test('POST /wallet/topup with missing packageId returns 400', async () => {
    const { status, data } = await apiCall('POST', '/wallet/topup', {}, accessToken)
    expect(status).toBe(400)
    expect(data.error).toBe('MISSING_PACKAGE_ID')
  })

  test('POST /wallet/topup with non-existent packageId returns 404', async () => {
    const { status, data } = await apiCall(
      'POST',
      '/wallet/topup',
      { packageId: '000000000000000000000099' },
      accessToken
    )
    expect(status).toBe(404)
    expect(data.error).toBe('PACKAGE_NOT_FOUND')
  })

  test('coin payment with insufficient balance returns 402 INSUFFICIENT_COINS (FR-15)', async () => {
    // Register another fresh user to ensure a 0-balance wallet, then attempt a coin purchase
    const email2 = `wallet-broke-${Date.now()}@test.com`
    await apiCall('POST', '/auth/register', {
      email: email2,
      password: 'Smoke1234!',
      displayName: 'Broke User',
    })
    const { data: loginData } = await apiCall('POST', '/auth/login', {
      email: email2,
      password: 'Smoke1234!',
    })
    const brokeToken = loginData.accessToken as string

    // Get any published book
    const { data: booksData } = await apiCall('GET', '/books?limit=1')
    const books = (booksData.items as Array<Record<string, unknown>>) ?? []
    if (books.length === 0) return

    const { status, data } = await apiCall(
      'POST',
      '/orders',
      { bookId: books[0]._id, type: 'buy', paymentMethod: 'coin' },
      brokeToken
    )
    expect(status).toBe(402)
    expect(data.error).toBe('INSUFFICIENT_COINS')
  })
})
