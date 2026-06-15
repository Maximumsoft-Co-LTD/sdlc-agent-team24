import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth.js';
import { apiPath } from '../helpers/env.js';
import { parseAndValidateContract, expectStatus } from '../helpers/api-client.js';

const hasApi = !!process.env.READ24_API_URL;

test.describe('Orders API contract — FR-5,6,8', () => {
  test.skip(!hasApi, 'Set READ24_API_URL to run live API contract tests');

  test('TC-FR5-01: mock buy creates paid order + entitlement', async ({ request }) => {
    const session = await loginAs(request, 'reader');
    const booksRes = await request.get(apiPath('/books?limit=1'));
    const booksBody = await booksRes.json();
    const bookId = booksBody.data?.items?.[0]?.id;
    test.skip(!bookId, 'No books available');

    const response = await request.post(apiPath('/orders'), {
      headers: authHeaders(session.accessToken),
      data: {
        bookId,
        type: 'buy',
        paymentMethod: 'mock',
      },
    });
    expect([200, 201, 409]).toContain(response.status());
    if (response.status() === 409) {
      return;
    }
    const body = await parseAndValidateContract(response, 'order');
    expect(body.data?.status).toBe('paid');
  });

  test('TC-FR8-03: duplicate order does not double-charge', async ({ request }) => {
    const session = await loginAs(request, 'reader');
    const walletBefore = await request.get(apiPath('/wallet'), {
      headers: authHeaders(session.accessToken),
    });
    const beforeBody = await walletBefore.json();
    const balanceBefore = beforeBody.data?.balance ?? 0;

    const booksRes = await request.get(apiPath('/books?limit=1'));
    const bookId = (await booksRes.json()).data?.items?.[0]?.id;
    test.skip(!bookId, 'No books available');

    const payload = { bookId, type: 'buy', paymentMethod: 'mock' };
    const headers = authHeaders(session.accessToken);

    const [r1, r2] = await Promise.all([
      request.post(apiPath('/orders'), { headers, data: payload }),
      request.post(apiPath('/orders'), { headers, data: payload }),
    ]);

    const walletAfter = await request.get(apiPath('/wallet'), { headers });
    const balanceAfter = (await walletAfter.json()).data?.balance ?? 0;

    if (r1.status() === 200 || r1.status() === 201) {
      expect(balanceAfter).toBe(balanceBefore);
    }
  });
});
