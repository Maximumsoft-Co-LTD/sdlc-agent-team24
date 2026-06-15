import type { APIRequestContext, APIResponse } from '@playwright/test';
import { authLoginResponseSchema } from '../schemas/auth.js';
import { booksListResponseSchema, bookDetailResponseSchema } from '../schemas/books.js';
import { orderResponseSchema } from '../schemas/orders.js';
import { walletBalanceSchema } from '../schemas/wallet.js';
import { libraryResponseSchema } from '../schemas/library.js';
import { cartResponseSchema, cartCheckoutResponseSchema } from '../schemas/cart.js';
import type { z } from 'zod';

type Schema = z.ZodTypeAny;

const schemaByName = {
  authLogin: authLoginResponseSchema,
  booksList: booksListResponseSchema,
  bookDetail: bookDetailResponseSchema,
  order: orderResponseSchema,
  walletBalance: walletBalanceSchema,
  library: libraryResponseSchema,
  cart: cartResponseSchema,
  cartCheckout: cartCheckoutResponseSchema,
} as const satisfies Record<string, Schema>;

export type ContractSchemaName = keyof typeof schemaByName;

export async function parseAndValidateContract<T extends ContractSchemaName>(
  response: APIResponse,
  schemaName: T,
): Promise<z.infer<(typeof schemaByName)[T]>> {
  const body = await response.json();
  return schemaByName[schemaName].parse(body);
}

export async function expectStatus(
  response: APIResponse,
  status: number,
): Promise<void> {
  if (response.status() !== status) {
    const text = await response.text();
    throw new Error(`Expected HTTP ${status}, got ${response.status()}: ${text}`);
  }
}

export async function getJson(request: APIRequestContext, path: string, headers?: Record<string, string>) {
  return request.get(path, { headers });
}

export async function postJson(
  request: APIRequestContext,
  path: string,
  data: unknown,
  headers?: Record<string, string>,
) {
  return request.post(path, { data, headers });
}
