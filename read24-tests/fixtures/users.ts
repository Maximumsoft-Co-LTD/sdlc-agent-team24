/** QA-001 §2.1 — demo test accounts */
export const users = {
  reader: {
    email: 'reader@demo.test',
    password: 'ReaderPass123!',
    displayName: 'Demo Reader',
    role: 'reader' as const,
  },
  publisherA: {
    email: 'publisher-a@demo.test',
    password: 'PublisherPass123!',
    displayName: 'Publisher A',
    role: 'publisher' as const,
    publisher_id: 'pub-a-0001',
  },
  publisherB: {
    email: 'publisher-b@demo.test',
    password: 'PublisherPass123!',
    displayName: 'Publisher B',
    role: 'publisher' as const,
    publisher_id: 'pub-b-0002',
  },
  admin: {
    email: 'admin@demo.test',
    password: 'AdminPass123!',
    displayName: 'Demo Admin',
    role: 'admin' as const,
  },
} as const;

export type DemoUserKey = keyof typeof users;
