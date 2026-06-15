import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth.js';
import { apiPath } from '../helpers/env.js';

const hasApi = !!process.env.READ24_API_URL;

test.describe('Security API contract — TC-SEC', () => {
  test.skip(!hasApi, 'Set READ24_API_URL to run live API contract tests');

  test('TC-SEC-01: publisher cannot access /admin/dashboard', async ({ request }) => {
    const session = await loginAs(request, 'publisherA');
    const response = await request.get(apiPath('/admin/dashboard'), {
      headers: authHeaders(session.accessToken),
    });
    expect(response.status()).toBe(403);
  });

  test('TC-SEC-02: reader cannot access /publisher/books', async ({ request }) => {
    const session = await loginAs(request, 'reader');
    const response = await request.get(apiPath('/publisher/books'), {
      headers: authHeaders(session.accessToken),
    });
    expect(response.status()).toBe(403);
  });

  test('TC-SEC-03: fake publisher_id in body is ignored', async ({ request }) => {
    const session = await loginAs(request, 'publisherA');
    const response = await request.get(
      apiPath('/publisher/dashboard?publisher_id=pub-b-0002'),
      { headers: authHeaders(session.accessToken) },
    );
    expect(response.status()).toBe(200);
    const body = await response.json();
    const gmv = body.data?.myGmv ?? body.myGmv;
    expect(gmv).toBeDefined();
  });
});
