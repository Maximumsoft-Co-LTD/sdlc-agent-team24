# DB-001 — Database Schema & Migrations

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §4, NFR-3, NFR-5, NFR-8 |
| ขึ้นกับ | INFRA-001 |
| บล็อก | BE-001~011 ทั้งหมด |

## งานที่ต้องทำ

### Sprint 1 — ตารางแกนหลัก

- [ ] `users` — id (uuid PK), email (citext UNIQUE), password_hash (Argon2id), display_name, role enum(**'reader','publisher','admin'**) default 'reader', **publisher_id uuid FK null**, created_at
- [ ] `publishers` — id, name, revenue_share (default 0.70), **is_exclusive_default bool**, **contract_ref**, **territory default 'TH'**, created_at
- [ ] `books` — id, title, author, description, category, cover_url, epub_key, price_buy, price_rent, rent_days (default 7), publisher_id FK, status enum(**'draft','pending_review','published','suspended','rejected'**) default 'draft', **is_exclusive bool**, created_at, **published_at**
- [ ] `orders` — id, user_id FK, status (pending/paid/failed/refunded), amount_gross, payment_method enum(**'card','promptpay','coin'**), payment_ref, created_at, paid_at
- [ ] `order_items` — id, order_id FK, book_id FK, type enum('buy','rent'), unit_price, rent_days (เฉพาะ rent)
- [ ] `entitlements` — id, user_id FK, book_id FK, **order_item_id FK** (เปลี่ยนจาก order_id), type (own/rent), status (active/expired/revoked), expires_at, created_at · UNIQUE(user_id,book_id) WHERE status='active'
- [ ] `reading_progress` — PK(user_id, book_id), cfi, percent, updated_at
- [ ] `revenue_splits` — id, **order_item_id FK UNIQUE** (เปลี่ยนจาก order_id — คิดต่อรายการ), gross, gateway_fee, net, platform_cut, publisher_share, publisher_id FK, created_at

### Sprint 2 — กระเป๋าเหรียญ + ตะกร้า

- [ ] `wallets` — id, user_id FK UNIQUE, balance int default 0, updated_at
- [ ] `wallet_transactions` — id, wallet_id FK, type enum('topup','bonus','spend','refund','adjust'), amount int (+เข้า/−ออก), balance_after int, ref_type enum('topup','order','manual'), ref_id, created_at
- [ ] `coin_packages` — id, coins int, bonus int default 0, price_thb int, active bool
- [ ] `topups` — id, user_id FK, package_id FK, coins int, bonus int, amount_gross int, status (pending/paid/failed), payment_method (card/promptpay), payment_ref, created_at, paid_at
- [ ] `carts` — id, user_id FK UNIQUE
- [ ] `cart_items` — id, cart_id FK, book_id FK, UNIQUE(cart_id, book_id)

### Sprint 3 — Audit Log

- [ ] `audit_logs` — id, actor_user_id FK, action (publish/suspend/reject/approve), target_type, target_id, note, created_at

### Indexes ที่ต้องสร้าง

- [ ] `books(status, category)`
- [ ] Full-text GIN บน `books(title, author)` (FR-3)
- [ ] `entitlements(user_id, status)`
- [ ] `entitlements(status, expires_at)` — rental expiry job
- [ ] `orders(user_id, created_at)`
- [ ] `wallet_transactions(wallet_id, created_at)` — ประวัติ

### Business Rules & Constraints (NFR-5, NFR-8)

- [ ] `platform_cut + publisher_share = net` ต้องตรงทุกแถว
- [ ] ไม่มี entitlement ที่ไม่มี order_item รองรับ
- [ ] `wallets.balance = SUM(wallet_transactions.amount)` ทุกบัญชี
- [ ] `citext` extension สำหรับ email (case-insensitive)
- [ ] Daily reconciliation queries: orders(paid) vs entitlements + wallet balance vs ledger

### Migration Setup

- [ ] ตั้ง migration tool (TypeORM migrations หรือ Flyway)
- [ ] Migration รัน idempotent (up/down)
- [ ] Seed script: coin_packages เริ่มต้น (50/100/300+15/500+40/1000+120)

## Definition of Done

- [ ] `docker-compose up` มี schema ครบ Sprint 1–3
- [ ] Migrations รัน idempotent
- [ ] Reconciliation queries พร้อมใช้ (entitlement + wallet)
