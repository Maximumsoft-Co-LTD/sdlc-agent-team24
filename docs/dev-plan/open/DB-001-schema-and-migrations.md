# DB-001 — Database Schema & Migrations

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §4, BackOffice §4 |
| ขึ้นกับ | INFRA-001 |
| บล็อก | BE-001~012 ทั้งหมด |

> MongoDB collections — enum = string field ที่จำกัดค่าที่อนุญาต; reference ใช้ ObjectId (บังคับความสัมพันธ์ที่ชั้น app ไม่มี FK จริง)

## Sprint 1 — คอลเลกชันแกนหลัก

- [ ] `users` — _id, email (string lowercase + unique index), password_hash (Argon2id), display_name, role string('reader','publisher','admin') default 'reader', publisher_id ObjectId ref null, created_at
- [ ] `publishers` — _id, name, revenue_share number default 0.70, is_exclusive_default bool, contract_ref, territory default 'TH', created_at
- [ ] `books` — _id, title, author, description, category, cover_url, epub_key, price_buy, price_rent, rent_days default 7, publisher_id ObjectId ref, status string('draft','pending_review','published','suspended','rejected') default 'draft', is_exclusive bool, created_at, published_at
- [ ] `orders` — _id, user_id ObjectId ref, status string('pending','paid','failed','refunded'), amount_gross, payment_method string('card','promptpay','coin'), payment_ref, created_at, paid_at
- [ ] `order_items` — _id, order_id ObjectId ref, book_id ObjectId ref, type string('buy','rent'), unit_price, rent_days
- [ ] `entitlements` — _id, user_id ObjectId ref, book_id ObjectId ref, order_item_id ObjectId ref, type string('own','rent'), status string('active','expired','revoked'), expires_at, created_at · unique index (user_id, book_id) partial where status='active'
- [ ] `reading_progress` — _id, user_id ObjectId ref, book_id ObjectId ref, cfi, percent, updated_at · unique index (user_id, book_id)
- [ ] `revenue_splits` — _id, order_item_id ObjectId ref (unique index), gross, gateway_fee, net, platform_cut, publisher_share, publisher_id ObjectId ref, created_at

## Sprint 2 — กระเป๋าเหรียญ + ตะกร้า

- [ ] `wallets` — _id, user_id ObjectId ref (unique index), balance int default 0, updated_at
- [ ] `wallet_transactions` — _id, wallet_id ObjectId ref, type string('topup','bonus','spend','refund','adjust'), amount int, balance_after int, ref_type, ref_id, created_at
- [ ] `coin_packages` — _id, coins, bonus default 0, price_thb, active bool
- [ ] `topups` — _id, user_id ObjectId ref, package_id ObjectId ref, coins, bonus, amount_gross, status string('pending','paid','failed'), payment_method, payment_ref, created_at, paid_at
- [ ] `carts` — _id, user_id ObjectId ref (unique index)
- [ ] `cart_items` — _id, cart_id ObjectId ref, book_id ObjectId ref · unique index (cart_id, book_id)

## Sprint 3 — Back Office

- [ ] `audit_logs` — _id, actor_user_id ObjectId ref, action string('submit','approve','publish','reject','suspend','price_change','payout'), target_type, target_id, note, created_at
- [ ] `book_status_history` *(ทางเลือก)* — _id, book_id ObjectId ref, from_status, to_status, actor, reason, created_at
- [ ] `payouts` *(เฟสถัดไป — schema เตรียมไว้ก่อน)* — _id, publisher_id ObjectId ref, period_start, period_end, amount, status string('pending','paid'), paid_at, ref

## Indexes

- [ ] `books(status, category)`
- [ ] MongoDB text index บน `books(title, author)` (FR-3)
- [ ] `entitlements(user_id, status)` · `entitlements(status, expires_at)`
- [ ] `orders(user_id, created_at)` · `orders(paid_at)` (dashboard queries)
- [ ] `wallet_transactions(wallet_id, created_at)`
- [ ] `revenue_splits(publisher_id, created_at)` (publisher dashboard)
- [ ] `audit_logs(actor_user_id, created_at)` · `audit_logs(target_type, target_id)`

## Business Rules

- [ ] `platform_cut + publisher_share = net` ทุก document
- [ ] ไม่มี entitlement ที่ไม่มี order_item รองรับ
- [ ] `wallets.balance = SUM(wallet_transactions.amount)` ทุกบัญชี

> หมายเหตุ: ตรวจ reconciliation ด้วยมือระหว่าง demo — ไม่มี cron

## Definition of Done

- [ ] `docker-compose up` → สร้าง Mongo collections + indexes ครบ
- [ ] init script idempotent (รันซ้ำได้ไม่พัง)
- [ ] Seed: coin_packages (50/100/300+15/500+40/1000+120)
- [ ] Seed: demo accounts (reader / publisher / admin)
