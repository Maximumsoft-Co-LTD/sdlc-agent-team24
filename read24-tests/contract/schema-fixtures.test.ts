import { describe, it, expect } from 'vitest';
import * as apiResponses from '../fixtures/api-responses.js';
import {
  authLoginResponseSchema,
  booksListResponseSchema,
  bookDetailResponseSchema,
  orderResponseSchema,
  walletBalanceSchema,
  libraryResponseSchema,
  cartCheckoutResponseSchema,
} from '../schemas/index.js';
import { bookDetailForbiddenKeys } from '../schemas/books.js';

/**
 * Contract tests — validate golden fixtures against Zod schemas.
 * Runs without live API (QA-001 contract baseline).
 */
describe('API contract fixtures — schema validation', () => {
  const cases = [
    { name: 'TC-FR1-02 auth login success', schema: authLoginResponseSchema, data: apiResponses.authLoginSuccess },
    { name: 'TC-FR1-04 auth login failure', schema: authLoginResponseSchema, data: apiResponses.authLoginFailure },
    { name: 'TC-FR2-01 books list', schema: booksListResponseSchema, data: apiResponses.booksListSuccess },
    { name: 'TC-FR2-02 book detail', schema: bookDetailResponseSchema, data: apiResponses.bookDetailSuccess },
    { name: 'TC-FR5-01 order buy', schema: orderResponseSchema, data: apiResponses.orderBuySuccess },
    { name: 'TC-FR13 wallet balance', schema: walletBalanceSchema, data: apiResponses.walletBalanceSuccess },
    { name: 'TC-FR10 library', schema: libraryResponseSchema, data: apiResponses.librarySuccess },
    { name: 'TC-FR19 cart checkout', schema: cartCheckoutResponseSchema, data: apiResponses.cartCheckoutSuccess },
  ] as const;

  for (const tc of cases) {
    it(tc.name, () => {
      const result = tc.schema.safeParse(tc.data);
      expect(result.success).toBe(true);
    });
  }

  it('TC-FR12: book responses must not expose forbidden keys', () => {
    const serialized = JSON.stringify(apiResponses.bookDetailSuccess);
    for (const key of bookDetailForbiddenKeys) {
      expect(serialized).not.toContain(`"${key}"`);
    }
  });

  it('TC-FR15-02: insufficient coins error shape', () => {
    expect(apiResponses.insufficientCoinsError.error?.code).toBe('INSUFFICIENT_COINS');
  });

  it('TC-SEC-01: forbidden error shape', () => {
    expect(apiResponses.forbiddenError.error?.code).toBe('FORBIDDEN');
  });
});
