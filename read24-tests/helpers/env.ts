export const env = {
  apiUrl: process.env.READ24_API_URL ?? 'http://localhost:3000',
  apiPrefix: '/api/v1',
  isApiAvailable: process.env.READ24_API_URL !== undefined,
} as const;

export function apiPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${env.apiPrefix}${normalized}`;
}
