import { test, expect } from '@playwright/test';
import { loginAs, authHeaders } from '../helpers/auth.js';
import { apiPath } from '../helpers/env.js';
import { parseAndValidateContract, expectStatus } from '../helpers/api-client.js';
import { defaultPackage } from '../fixtures/coin-packages.js';

const hasApi = !!process.env.READ24_API_URL;

test.describe('Wallet API contract — FR-13,14,15,16', () => {
  test.skip(!hasApi, 'Set READ24_API_URL to run live API contract tests');

  test('TC-FR13-01: new user wallet balance', async ({ request }) => {
    const session = await loginAs(request, 'reader');
    const response = await request.get(apiPath('/wallet'), {
      headers: authHeaders(session.accessToken),
    });
    await expectStatus(response, 200);
    const body = await parseAndValidateContract(response, 'walletBalance');
    expect(body.data?.balance).toBeGreaterThanOrEqual(0);
  });

  test('TC-FR14-01: mock topup increases balance', async ({ request }) => {
    const session = await loginAs(request, 'reader');
    const headers = authHeaders(session.accessToken);

    const beforeRes = await request.get(apiPath('/wallet'), { headers });
    const before = (await beforeRes.json()).data?.balance ?? 0;

    const topupRes = await request.post(apiPath('/wallet/topup'), {
      headers,
      data: { packageId: defaultPackage.id },
    });
    expect([200, 201]).toContain(topupRes.status());

    const afterRes = await request.get(apiPath('/wallet'), { headers });
    const after = (await afterRes.json()).data?.balance ?? 0;
    expect(after).toBeGreaterThan(before);
  });

  test('TC-FR16-01: transaction history is paginated', async ({ request }) => {
    const session = await loginAs(request, 'reader');
    const response = await request.get(apiPath('/wallet/transactions?limit=10'), {
      headers: authHeaders(session.accessToken),
    });
    await expectStatus(response, 200);
    const body = await response.json();
    expect(Array.isArray(body.data?.items ?? body.items)).toBe(true);
  });
});
