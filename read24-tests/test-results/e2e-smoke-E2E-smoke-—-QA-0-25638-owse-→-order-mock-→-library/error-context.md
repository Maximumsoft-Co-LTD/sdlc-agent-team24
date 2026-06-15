# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/smoke.spec.ts >> E2E smoke — QA-001 §3 >> E2E-1: browse → order (mock) → library
- Location: e2e/smoke.spec.ts:10:3

# Error details

```
SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

# Test source

```ts
  1  | import type { APIRequestContext } from '@playwright/test';
  2  | import { users, type DemoUserKey } from '../fixtures/users.js';
  3  | import { apiPath } from './env.js';
  4  | 
  5  | export interface AuthSession {
  6  |   accessToken: string;
  7  |   user: {
  8  |     id?: string;
  9  |     email: string;
  10 |     role: string;
  11 |   };
  12 | }
  13 | 
  14 | export async function loginAs(
  15 |   request: APIRequestContext,
  16 |   userKey: DemoUserKey,
  17 | ): Promise<AuthSession> {
  18 |   const user = users[userKey];
  19 |   const response = await request.post(apiPath('/auth/login'), {
  20 |     data: {
  21 |       email: user.email,
  22 |       password: user.password,
  23 |     },
  24 |   });
  25 | 
> 26 |   const body = await response.json();
     |                ^ SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
  27 |   const token =
  28 |     body?.data?.accessToken ??
  29 |     body?.accessToken ??
  30 |     '';
  31 | 
  32 |   return {
  33 |     accessToken: token,
  34 |     user: {
  35 |       email: user.email,
  36 |       role: user.role,
  37 |       id: body?.data?.user?.id ?? body?.user?.id,
  38 |     },
  39 |   };
  40 | }
  41 | 
  42 | export function authHeaders(token: string): Record<string, string> {
  43 |   return {
  44 |     Authorization: `Bearer ${token}`,
  45 |     Accept: 'application/json',
  46 |     'Content-Type': 'application/json',
  47 |   };
  48 | }
  49 | 
```