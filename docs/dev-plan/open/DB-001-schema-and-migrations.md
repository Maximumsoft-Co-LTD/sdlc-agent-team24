# DB-001 — Database Schema & Migrations

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §4, BackOffice §4, NFR-3,5,8 |
| ขึ้นกับ | INFRA-001 |
| บล็อก | BE-001~012 ทั้งหมด |

## Sprint 1 — ตารางแกนหลัก

- [ ] `users` — id, email (citext UNIQUE), password_hash (Argon2id), display_name, role enum('reader','publisher','admin') default 'reader', publisher_id uuid FK null, created_at
- [ ] `publishers` — id, name, revenue_share numeric default 0.70, is_exclusive_default bool, contract_ref, territory default 'TH', created_at
- [ ] `books` — id, title, author, description, category, cover_url, epub_key, price_buy, price_rent, rent_days default 7, publisher_id FK, status enum('draft','pending_review','published','suspended','rejected') default 'draft', is_exclusive bool, created_at, published_at
- [ ] `orders` — id, user_id FK, status (pending/paid/failed/refunded), amount_gross, payment_method enum('card','promptpay','coin'), payment_ref, created_at, paid_at
- [ ] `order_items` — id, order_id FK, book_id FK, type enum('buy','rent'), unit_price, rent_days
- [ ] `entitlements` — id, user_id FK, book_id FK, order_item_id FK, type (own/rent), status (active/expired/revoked), expires_at, created_at · UNIQUE(user_id,book_id) WHERE status='active'
- [ ] `reading_progress` — PK(user_id,book_id), cfi, percent, updated_at
- [ ] `revenue_splits` — id, order_item_id FK UNIQUE, gross, gateway_fee, net, platform_cut, publisher_share, publisher_id FK, created_at

## Sprint 2 — กระเป๋าเหรียญ + ตะกร้า

- [ ] `wallets` — id, user_id FK UNIQUE, balance int default 0, updated_at
- [ ] `wallet_transactions` — id, wallet_id FK, type enum('topup','bonus','spend','refund','adjust'), amount int, balance_after int, ref_type, ref_id, created_at
- [ ] `coin_packages` — id, coins, bonus default 0, price_thb, active bool
- [ ] `topups` — id, user_id FK, package_id FK, coins, bonus, amount_gross, status (pending/paid/failed), payment_method, payment_ref, created_at, paid_at
- [ ] `carts` — id, user_id FK UNIQUE
- [ ] `cart_items` — id, cart_id FK, book_id FK · UNIQUE(cart_id,book_id)

## Sprint 3 — Back Office

- [ ] `audit_logs` — id, actor_user_id FK, action enum('submit','approve','publish','reject','suspend','price_change','payout'), target_type, target_id, note, created_at
- [ ] `book_status_history` *(ทางเลือก)* — id, book_id, from_status, to_status, actor, reason, created_at
- [ ] `payouts` *(เฟสถัดไป — schema เตรียมไว้ก่อน)* — id, publisher_id FK, period_start, period_end, amount, status (pending/paid), paid_at, ref

## Indexes

- [ ] `books(status, category)`
- [ ] Full-text GIN บน `books(title, author)` (FR-3)
- [ ] `entitlements(user_id, status)` · `entitlements(status, expires_at)`
- [ ] `orders(user_id, created_at)` · `orders(paid_at)` (dashboard queries)
- [ ] `wallet_transactions(wallet_id, created_at)`
- [ ] `revenue_splits(publisher_id, created_at)` (publisher dashboard)
- [ ] `audit_logs(actor_user_id, created_at)` · `audit_logs(target_type, target_id)`

## Business Rules (NFR-5, NFR-8)

- [ ] `platform_cut + publisher_share = net` ทุกแถว
- [ ] ไม่มี entitlement ที่ไม่มี order_item รองรับ
- [ ] `wallets.balance = SUM(wallet_transactions.amount)` ทุกบัญชี
- [ ] Daily reconciliation queries: orders(paid) vs entitlements + wallet balance vs ledger

## Definition of Done

- [ ] `docker-compose up` → schema ครบทุก Sprint
- [ ] Migrations รัน idempotent (up/down)
- [ ] Seed: coin_packages (50/100/300+15/500+40/1000+120)
- [ ] Reconciliation queries พร้อมใช้
