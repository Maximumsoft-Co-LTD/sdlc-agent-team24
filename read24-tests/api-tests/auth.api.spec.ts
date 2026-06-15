import { test, expect } from '@playwright/test';
import { users } from '../fixtures/users.js';
import { publishedBooks } from '../fixtures/books.js';
import { loginAs, authHeaders } from '../helpers/auth.js';
import { apiPath } from '../helpers/env.js';
import {
  parseAndValidateContract,
  expectStatus,
} from '../helpers/api-client.js';

const hasApi = !!process.env.READ24_API_URL;

test.describe('Auth API contract — FR-1', () => {
  test.skip(!hasApi, 'Set READ24_API_URL to run live API contract tests');

  test('TC-FR1-02: POST /auth/login returns valid contract', async ({ request }) => {
    const response = await request.post(apiPath('/auth/login'), {
      data: {
        email: users.reader.email,
        password: users.reader.password,
      },
    });
    await expectStatus(response, 200);
    const body = await parseAndValidateContract(response, 'authLogin');
    expect(body.data?.accessToken).toBeTruthy();
    expect(body.data?.user.role).toBe('reader');
  });

  test('TC-FR1-04: wrong password returns 401', async ({ request }) => {
    const response = await request.post(apiPath('/auth/login'), {
      data: {
        email: users.reader.email,
        password: 'wrong-password',
      },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error?.code).toMatch(/INVALID_CREDENTIALS/);
  });

  test('TC-FR1-06: GET /me returns profile', async ({ request }) => {
    const session = await loginAs(request, 'reader');
    const response = await request.get(apiPath('/me'), {
      headers: authHeaders(session.accessToken),
    });
    await expectStatus(response, 200);
    const body = await response.json();
    expect(body.data?.email ?? body.email).toBe(users.reader.email);
  });
});
