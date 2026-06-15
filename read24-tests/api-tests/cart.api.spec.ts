import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth.js';
import { apiPath } from '../helpers/env.js';
import { parseAndValidateContract, expectStatus } from '../helpers/api-client.js';

const hasApi = !!process.env.READ24_API_URL;

test.describe('Cart API contract — FR-19', () => {
  test.skip(!hasApi, 'Set READ24_API_URL to run live API contract tests');

  test('TC-FR19-01: add item to cart', async ({ request }) => {
    const session = await loginAs(request, 'reader');
    const headers = authHeaders(session.accessToken);

    const booksRes = await request.get(apiPath('/books?limit=1'));
    const bookId = (await booksRes.json()).data?.items?.[0]?.id;
    test.skip(!bookId, 'No books available');

    const response = await request.post(apiPath('/cart/items'), {
      headers,
      data: { bookId },
    });
    expect([200, 201, 409]).toContain(response.status());

    const cartRes = await request.get(apiPath('/cart'), { headers });
    await expectStatus(cartRes, 200);
    const cart = await parseAndValidateContract(cartRes, 'cart');
    expect(cart.data?.count).toBeGreaterThanOrEqual(0);
  });

  test('TC-FR19-04: adding rent to cart returns 400', async ({ request }) => {
    const session = await loginAs(request, 'reader');
    const headers = authHeaders(session.accessToken);

    const booksRes = await request.get(apiPath('/books?limit=50'));
    const rentable = ((await booksRes.json()).data?.items ?? []).find(
      (b: { priceRent: number | null }) => b.priceRent !== null,
    );
    test.skip(!rentable, 'No rentable book');

    const response = await request.post(apiPath('/cart/items'), {
      headers,
      data: { bookId: rentable.id, type: 'rent' },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error?.code).toMatch(/CART_BUY_ONLY|VALIDATION_ERROR/);
  });
});
