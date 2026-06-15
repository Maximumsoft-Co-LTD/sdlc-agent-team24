import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth.js';
import { apiPath } from '../helpers/env.js';

const hasApi = !!process.env.READ24_API_URL;

test.describe('E2E smoke — QA-001 §3', () => {
  test.skip(!hasApi, 'Set READ24_API_URL to run live E2E smoke tests');

  test('E2E-1: browse → order (mock) → library', async ({ request }) => {
    const session = await loginAs(request, 'reader');
    const headers = authHeaders(session.accessToken);

    const booksRes = await request.get(apiPath('/books?limit=5'));
    expect(booksRes.ok()).toBeTruthy();

    const bookId = (await booksRes.json()).data?.items?.[0]?.id;
    test.skip(!bookId, 'No published books');

    const orderRes = await request.post(apiPath('/orders'), {
      headers,
      data: { bookId, type: 'buy', paymentMethod: 'mock' },
    });
    expect([200, 201, 409]).toContain(orderRes.status());

    const libRes = await request.get(apiPath('/library'), { headers });
    expect(libRes.ok()).toBeTruthy();
  });
});
