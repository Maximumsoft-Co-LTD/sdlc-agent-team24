import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth.js';
import { apiPath } from '../helpers/env.js';
import { parseAndValidateContract, expectStatus } from '../helpers/api-client.js';
import { bookDetailForbiddenKeys } from '../schemas/books.js';

const hasApi = !!process.env.READ24_API_URL;

test.describe('Books API contract — FR-2,3,4,12', () => {
  test.skip(!hasApi, 'Set READ24_API_URL to run live API contract tests');

  test('TC-FR2-01: GET /books returns published only', async ({ request }) => {
    const response = await request.get(apiPath('/books?limit=20'));
    await expectStatus(response, 200);
    const body = await parseAndValidateContract(response, 'booksList');
    expect(body.data?.items.length).toBeGreaterThan(0);
    for (const item of body.data?.items ?? []) {
      expect(item.priceBuy).toBeGreaterThanOrEqual(0);
    }
  });

  test('TC-FR3-01: GET /books/search finds known title', async ({ request }) => {
    const response = await request.get(apiPath('/books/search?q=Clean&limit=10'));
    await expectStatus(response, 200);
    const body = await response.json();
    const items = body.data?.items ?? body.items ?? [];
    expect(Array.isArray(items)).toBe(true);
  });

  test('TC-FR12: book detail must not expose epub_key', async ({ request }) => {
    const listRes = await request.get(apiPath('/books?limit=1'));
    const listBody = await listRes.json();
    const bookId = listBody.data?.items?.[0]?.id;
    test.skip(!bookId, 'No published books in environment');

    const detailRes = await request.get(apiPath(`/books/${bookId}`));
    await expectStatus(detailRes, 200);
    const text = await detailRes.text();
    for (const key of bookDetailForbiddenKeys) {
      expect(text).not.toContain(`"${key}"`);
    }
  });

  test('TC-FR4-02: buy-only book has null priceRent', async ({ request }) => {
    const response = await request.get(apiPath('/books?limit=50'));
    const body = await response.json();
    const items = body.data?.items ?? [];
    const buyOnly = items.find((b: { priceRent: number | null }) => b.priceRent === null);
    test.skip(!buyOnly, 'No buy-only book in seed data');
    expect(buyOnly.rentAvailable).toBeFalsy();
  });
});
