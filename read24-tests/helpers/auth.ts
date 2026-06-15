import type { APIRequestContext } from '@playwright/test';
import { users, type DemoUserKey } from '../fixtures/users.js';
import { apiPath } from './env.js';

export interface AuthSession {
  accessToken: string;
  user: {
    id?: string;
    email: string;
    role: string;
  };
}

export async function loginAs(
  request: APIRequestContext,
  userKey: DemoUserKey,
): Promise<AuthSession> {
  const user = users[userKey];
  const response = await request.post(apiPath('/auth/login'), {
    data: {
      email: user.email,
      password: user.password,
    },
  });

  const body = await response.json();
  const token =
    body?.data?.accessToken ??
    body?.accessToken ??
    '';

  return {
    accessToken: token,
    user: {
      email: user.email,
      role: user.role,
      id: body?.data?.user?.id ?? body?.user?.id,
    },
  };
}

export function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}
