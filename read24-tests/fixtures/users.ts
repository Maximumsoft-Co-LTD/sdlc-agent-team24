/** Demo accounts — must match repos/read24 seed (seed.ts + seed-books.ts) */
export const users = {
  reader: {
    email: 'reader@read24.com',
    password: 'Reader1234!',
    displayName: 'Reader Demo',
    role: 'reader' as const,
  },
  publisherA: {
    email: 'publisher@read24.com',
    password: 'Pub1234!',
    displayName: 'Publisher Demo',
    role: 'publisher' as const,
    publisher_id: 'pub-a-0001',
  },
  publisherB: {
    email: 'publisher@read24.com',
    password: 'Pub1234!',
    displayName: 'Publisher Demo',
    role: 'publisher' as const,
    publisher_id: 'pub-b-0002',
  },
  admin: {
    email: 'admin@read24.com',
    password: 'Admin1234!',
    displayName: 'Admin',
    role: 'admin' as const,
  },
} as const;

export type DemoUserKey = keyof typeof users;
