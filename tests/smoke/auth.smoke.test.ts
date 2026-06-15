import { apiCall } from './setup'

// Use a timestamp-scoped email so each test run is isolated
const testEmail = `smoke-${Date.now()}@test.com`
const testPassword = 'Smoke1234!'

describe('Auth flows (FR-1)', () => {
  // accessToken is shared across tests in declaration order
  let accessToken: string

  test('register new user returns 201 with email and reader role', async () => {
    const { status, data } = await apiCall('POST', '/auth/register', {
      email: testEmail,
      password: testPassword,
      displayName: 'Smoke Test User',
    })
    expect(status).toBe(201)
    // API returns: { userId, email, role }
    expect(data.email).toBe(testEmail)
    expect(data.role).toBe('reader')
    expect(data.userId).toBeTruthy()
  })

  test('login with correct credentials returns 200 with accessToken', async () => {
    const { status, data } = await apiCall('POST', '/auth/login', {
      email: testEmail,
      password: testPassword,
    })
    expect(status).toBe(200)
    expect(data.accessToken).toBeTruthy()
    // user sub-object from login response
    const user = data.user as Record<string, unknown>
    expect(user.role).toBe('reader')
    expect(user.email).toBe(testEmail)
    accessToken = data.accessToken as string
  })

  test('login with wrong password returns 401', async () => {
    const { status, data } = await apiCall('POST', '/auth/login', {
      email: testEmail,
      password: 'wrongpassword',
    })
    expect(status).toBe(401)
    expect(data.error).toBe('INVALID_CREDENTIALS')
  })

  test('GET /me with valid token returns profile with balance=0', async () => {
    const { status, data } = await apiCall('GET', '/me', undefined, accessToken)
    expect(status).toBe(200)
    expect(data.email).toBe(testEmail)
    // Newly registered user always starts at balance 0
    expect(data.balance).toBe(0)
    expect(data.role).toBe('reader')
  })

  test('GET /me without token returns 401', async () => {
    const { status } = await apiCall('GET', '/me')
    expect(status).toBe(401)
  })

  test('register with duplicate email returns 409 EMAIL_TAKEN', async () => {
    const { status, data } = await apiCall('POST', '/auth/register', {
      email: testEmail,
      password: testPassword,
      displayName: 'Duplicate',
    })
    expect(status).toBe(409)
    expect(data.error).toBe('EMAIL_TAKEN')
  })

  test('register with missing fields returns 400', async () => {
    const { status, data } = await apiCall('POST', '/auth/register', {
      email: `missing-${Date.now()}@test.com`,
      // password and displayName omitted
    })
    expect(status).toBe(400)
    expect(data.error).toBe('MISSING_FIELDS')
  })

  test('register with invalid email format returns 400', async () => {
    const { status, data } = await apiCall('POST', '/auth/register', {
      email: 'not-an-email',
      password: testPassword,
      displayName: 'Bad Email',
    })
    expect(status).toBe(400)
    expect(data.error).toBe('INVALID_EMAIL')
  })

  test('register with password shorter than 8 chars returns 400', async () => {
    const { status, data } = await apiCall('POST', '/auth/register', {
      email: `short-pw-${Date.now()}@test.com`,
      password: 'abc',
      displayName: 'Short PW',
    })
    expect(status).toBe(400)
    expect(data.error).toBe('PASSWORD_TOO_SHORT')
  })
})
