# Read24 Smoke Tests

API smoke tests for key demo flows. Requires the app to be running at localhost:3000 with a seeded database.

## Setup

```bash
# 1. Start services
docker-compose up -d

# 2. Start app
npm run dev   # inside repos/read24/

# 3. Seed demo accounts and coin packages
curl -X POST http://localhost:3000/api/v1/seed

# 4. Run smoke tests
cd tests/smoke
npx jest --config jest.config.ts
```

Or from inside `repos/read24/`:

```bash
npm run test:smoke
```

## Environment Variables

| Variable | Default |
|----------|---------|
| `APP_URL` | `http://localhost:3000` |
| `MONGODB_URI` | `mongodb://root:password@localhost:27017/read24?authSource=admin` |

## Test Coverage

| File | FR / Areas Covered |
|------|--------------------|
| `auth.smoke.test.ts` | FR-1 — register, login, /me, 401/409 edge cases |
| `books.smoke.test.ts` | FR-2, FR-3, FR-4 — listing, search, epub_key omission |
| `orders.smoke.test.ts` | FR-5, FR-6, FR-8, FR-10 — buy, rent, duplicate, library |
| `wallet.smoke.test.ts` | FR-13, FR-14, FR-15, FR-16 — topup, transactions, insufficient coins |
| `cart.smoke.test.ts` | FR-19 — add/remove items, checkout, empty-cart guard |
| `backoffice.smoke.test.ts` | FR-11, FR-17, FR-18, FR-20, Security — publisher/admin RBAC, KPIs, audit logs |

## Seeded Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@read24.com | Admin1234! |
| Publisher | publisher@read24.com | Pub1234! |
| Reader | reader@read24.com | Reader1234! |

## Notes

- Tests run with `--runInBand` (sequentially) because `orders.smoke.test.ts` shares token state across tests in a single describe block.
- Each fresh-user test suite (`wallet`, `cart`) registers its own timestamped account, so reruns are safe.
- The `orders` and `backoffice` suites rely on seeded data; run `/api/v1/seed` first.
