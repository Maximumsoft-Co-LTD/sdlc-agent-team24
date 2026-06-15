# Read24 — Priority Plan (เว็บ Demo สำหรับนำเสนอ)

> เป้าหมาย: เดินวงจรผู้ใช้ให้ครบบน browser ตามดีไซน์ใน `docs/dev-plan/design/Read24 (1).html` เพื่อ **นำเสนอโปรเจกต์**
> Stack: **Next.js full-stack + MongoDB + MinIO (Docker)** · จ่ายเงิน/เติมเหรียญ = **mock** · อ้างอิง: `TechStack.md` · อัพเดต: 2026-06-15

## หลักการของแผนนี้

1. **โชว์ flow ครบตามดีไซน์** สำคัญกว่า production-grade
2. **Mock แทนของจริง** ทุกอย่างที่ผูกเงิน/external — payment, topup (ไม่ต่อ Stripe/Omise, ไม่มี webhook)
3. **ตัดงานที่ไม่โชว์ในการนำเสนอ** — load test, monitoring, reconcile cron, read replica, Redis, coverage gate
4. **ไม่มี blocker จาก gateway** — เริ่มเขียนโค้ดได้ตั้งแต่วันแรก

---

## หน้าจอที่ต้องมี (จากดีไซน์)

| กลุ่ม | หน้าจอในดีไซน์ | Task ที่เกี่ยว |
|------|----------------|----------------|
| ผู้อ่าน | หน้าร้าน catalog (แบบ Shopify) + แยกประเภท + เรียงตาม + แนะนำ | FE-002, BE-002 |
| ผู้อ่าน | รายละเอียดหนังสือ (ซื้อขาด / เช่า / เพิ่มลงตะกร้า / เล่มอื่นที่น่าสนใจ) | FE-002, FE-003 |
| ผู้อ่าน | ตะกร้า + checkout | FE-007, BE-009 |
| ผู้อ่าน | ชั้นหนังสือ (เป็นเจ้าของ / กำลังเช่า / หมดอายุ) | FE-004, BE-004 |
| ผู้อ่าน | ตัวอ่าน EPUB (สารบัญ / เริ่มอ่าน) | FE-005, BE-005 |
| ผู้อ่าน | กระเป๋าเหรียญ + เลือกแพ็กเกจเติม (mock PromptPay) | FE-006, BE-008 |
| สำนักพิมพ์ | เมนูสำนักพิมพ์ / หนังสือของฉัน (ร่าง/รออนุมัติ/เผยแพร่) + เพิ่มหนังสือ | FE-008, BE-010 |
| สำนักพิมพ์ | แดชบอร์ด: รายได้ / ส่วนแบ่งของคุณ / ขาย | FE-010, BE-012 |
| แอดมิน | แดชบอร์ด Read24 + อนุมัติ/เผยแพร่ + ส่วนแบ่ง | FE-009, FE-010, BE-011, BE-012 |

---

## สิ่งที่ Mock / ตัดออก (เทียบแผน production เดิม)

| เดิม | Demo | วิธี |
|------|------|------|
| Payment gateway จริง + webhook (INFRA-002, Q-1) | **Mock** | `POST /orders` → `paid` + entitlement ในคำขอเดียว |
| Wallet topup เงินจริง | **Mock** | เลือกแพ็ก → `$inc` เหรียญเข้า wallet ทันที |
| Redis + BullMQ (queue/cache/rate-limit) | ตัด | ไม่ใช้ |
| Cron ตัดสิทธิ์เช่าหมดอายุ (BE-006) | **Lazy expiry** | เช็ค `expires_at` ตอนขอ content-url / ตอนแสดง library |
| PostgreSQL (GIN, SELECT FOR UPDATE, read replica) | **MongoDB** | text index + atomic `$inc` (`balance >= amount`) |
| S3 / R2 / CDN + presigned จริง | **MinIO (Docker)** | เก็บใน volume, ออก presigned URL จาก MinIO |
| Prometheus/Grafana/Sentry, load test (OPS-001) | ตัด | — |
| Reconciliation cron, coverage 80% gate | ตัด/ผ่อน | เหลือ smoke test เดิน flow |
| Import 500 เล่ม (OPS-002) | **Seed 15–30 เล่ม** | สคริปต์ seed สั้น |
| Refresh token rotation, MFA, load balancer | ตัด/ผ่อน | access token พอสำหรับ demo |

---

## Critical Path (Demo)

```
INFRA-001 ──► DB-001 ──► BE-001 ──► BE-003(mock) ──► BE-005 ──► FE-005
(Mongo+MinIO    (schema)   (auth)    (orders/        (content)   (reader)
 ใน Docker)                          entitlement)
```

> ❌ ไม่มี INFRA-002 บน critical path แล้ว — payment เป็น mock เริ่มได้ทันที

---

## Phase 0 — Prerequisites 🔴 (วันแรก — วิ่งขนานได้)

### 🎯 เป้าหมาย
ทุกคนรันโปรเจกต์ขึ้นได้ + ตัดสินใจค่าตัวเลขที่ใช้ใน demo (ราคาหนังสือ, แพ็กเกจเหรียญ, ส่วนแบ่ง %)

### ✅ เสร็จเมื่อ
- `docker-compose up` → **MongoDB + MinIO** ขึ้นครบ (ไม่มี Redis/payment)
- Next.js dev server ติดต่อ Mongo + MinIO ได้ (health check ผ่าน)
- PM เคาะ: coin packages (เช่น 100 / 300+โบนัส / 500), revenue_share เริ่มต้น (เช่น 70%), rent_days (เช่น 7)

| Task | ทำโดย |
|------|--------|
| **INFRA-001** Docker (Mongo + MinIO) + Next.js skeleton | DevOps/Dev |
| เคาะค่าตัวเลข demo (ราคา/แพ็ก/ส่วนแบ่ง) | PM |

> ❌ ตัด INFRA-002 (gateway), Q-1 — ใช้ mock · ดู **INFRA-002 ที่ถูกแปลงเป็น Mock Payment Adapter**

---

## Phase 1 — Database + Auth 🔴 (Week 1)

### 🎯 เป้าหมาย
schema (MongoDB collections) พร้อม + login/register/role ทำงาน

### ✅ เสร็จเมื่อ
- collections ครบสำหรับ demo (users, publishers, books, orders, order_items, entitlements, reading_progress, revenue_splits, wallets, wallet_transactions, coin_packages, topups, carts, cart_items, audit_logs)
- `POST /api/auth/register`, `POST /api/auth/login` คืน JWT ใช้งานได้
- Role guard กัน admin/publisher route

| ลำดับ | Task | ขึ้นกับ |
|-------|------|---------|
| 1 | **DB-001** Mongo Schema + seed (coin packages, demo accounts) | INFRA-001 |
| 2 | **BE-001** Auth + Role Guard (ไม่ทำ refresh rotation, ไม่มี Redis rate-limit) | DB-001 |

---

## Phase 2 — Catalog (Week 1–2)

### 🎯 เป้าหมาย
ผู้ใช้เข้าระบบและเลือกดูหนังสือได้ — หน้าร้านแบบดีไซน์ (catalog + ประเภท + เรียงตาม)

### ✅ เสร็จเมื่อ
- `/login`, `/register` ใช้งานบน browser
- หน้าร้านแสดง `status=published` + filter ประเภท + เรียงตาม + ค้นหา (Mongo text index)
- หน้ารายละเอียด: ปก, ราคา, ปุ่ม ซื้อขาด / เช่า / เพิ่มลงตะกร้า, "เล่มอื่นที่น่าสนใจ"
- เล่มที่ `price_rent=null` → ไม่แสดงปุ่มเช่า

| Task | ขึ้นกับ | ขนานกับ |
|------|---------|---------|
| **BE-002** Books API (Mongo text search, ไม่มี Redis cache) | DB-001, BE-001 | FE-001 |
| **FE-001** Auth Pages | BE-001 | BE-002 |
| **FE-002** Catalog + Detail | BE-002, FE-001 | — |

---

## Phase 3 — Core Transaction 🔴 (Week 2–3) — *mock payment*

### 🎯 เป้าหมาย
จ่าย (mock) แล้วได้สิทธิ์อ่านทันที — ทั้งซื้อขาดและเช่า, ออก content-url ให้เฉพาะผู้มีสิทธิ์

### ✅ เสร็จเมื่อ
- `POST /api/orders` (mock pay) → order `paid` + entitlement + revenue_split ในคำขอเดียว
- เช่า → entitlement มี `expires_at`; ซื้อขาด → ไม่มีวันหมด
- `GET /api/books/:id/content-url` คืน MinIO presigned URL เฉพาะผู้มีสิทธิ์ (ไม่มีสิทธิ์/หมดอายุ → 403, เช็ค lazy)
- `platform_cut + publisher_share = net` ทุกแถว revenue_split

| ลำดับ | Task | ขึ้นกับ | ขนานกับ |
|-------|------|---------|---------|
| 3-A | **BE-003** Orders (mock pay) + Entitlement + revenue_split | DB-001, BE-001 | — |
| 3-B | **BE-004** Library API (owned/renting/expired + daysLeft) | BE-003 | BE-005 |
| 3-C | **BE-005** Reader & Content API (MinIO presigned + lazy expiry + progress) | BE-003, INFRA-001 | BE-004 |

> ❌ ตัด BE-006 (BullMQ expiry worker) → ใช้ lazy expiry check แทน (รวมใน BE-005)

---

## Phase 4 — Frontend Transaction + Reader (Week 3–4)

### 🎯 เป้าหมาย
ผู้ใช้เดินวงจรครบบน browser: เลือก → จ่าย mock → อ่าน

### ✅ เสร็จเมื่อ
- กด ซื้อ/เช่า → modal จ่าย (mock, มี UI PromptPay จำลอง) → success → หนังสือเข้าชั้นหนังสือ
- หน้าชั้นหนังสือ แยก เป็นเจ้าของ / กำลังเช่า (เหลือ X วัน) / หมดอายุ
- กด "เปิดอ่าน" → epub.js โหลด EPUB จาก content-url, จำหน้าล่าสุด (CFI)
- เช่าหมดอายุ → popup "เช่าอีกครั้ง / ซื้อขาด"

| Task | ขึ้นกับ | ขนานกับ |
|------|---------|---------|
| **FE-003** Purchase Flow (mock payment modal) | BE-003, FE-002 | FE-004, FE-005 |
| **FE-004** My Library (ชั้นหนังสือ) | BE-004, FE-001 | FE-003, FE-005 |
| **FE-005** EPUB Reader | BE-005, FE-001 | FE-003, FE-004 |

---

## Phase 5 — Wallet + Cart (Week 4) — *mock topup*

### 🎯 เป้าหมาย
โชว์ระบบเหรียญ (เติม mock → จ่ายด้วยเหรียญ) และซื้อหลายเล่มในตะกร้า ตามดีไซน์

### ✅ เสร็จเมื่อ
- เลือกแพ็กเกจเหรียญ → mock topup → coins+bonus เข้า wallet ทันที, navbar อัปเดตยอด
- ซื้อหนังสือด้วยเหรียญ → ตัด balance ถูก (atomic) + ได้ entitlement; เหรียญไม่พอ → 402 + UI แนะนำเติม
- ตะกร้า: เพิ่มหลายเล่ม (เฉพาะซื้อขาด) → checkout ครั้งเดียว → ได้ entitlement ครบ
- `wallets.balance = SUM(wallet_transactions.amount)` (เช็คตอน demo, ไม่มี cron)

| ลำดับ | Task | ขึ้นกับ | ขนานกับ |
|-------|------|---------|---------|
| 5-A | **BE-008** Wallet & Coins API (mock topup, ไม่มี reconcile cron) | DB-001, BE-001 | FE-006 |
| 5-B | **BE-003 (update)** เพิ่มจ่ายด้วยเหรียญ | BE-008 | — |
| 5-C | **BE-009** Cart API | BE-003(updated), BE-008 | FE-006 |
| 5-D | **FE-006** Wallet & Topup Pages | BE-008 | — |
| 5-E | **FE-007** Cart & Checkout | BE-009, FE-006 | — |

---

## Phase 6 — Back Office (Week 5) — Publisher + Admin + Dashboard

### 🎯 เป้าหมาย
สำนักพิมพ์อัปโหลดหนังสือ + แอดมินอนุมัติ/เผยแพร่ + เห็น dashboard ส่วนแบ่งรายได้ ตามดีไซน์

### ✅ เสร็จเมื่อ
- publisher สร้าง draft → upload EPUB (MinIO) → submit (`pending_review`); เห็นตัวคำนวณส่วนแบ่งสด
- admin เห็น queue → publish (โผล่หน้าร้าน) / reject พร้อม reason / suspend (หายจากร้าน แต่ entitlement เดิมใช้ได้)
- ทุก action มีแถวใน `audit_logs`
- publisher dashboard เห็นเฉพาะของตน (IDOR: ผูก publisher_id จาก token); admin dashboard แสดง GMV / platform_cut / publisher_share + export CSV

| ลำดับ | Task | ขึ้นกับ | ขนานกับ |
|-------|------|---------|---------|
| 6-A | **BE-007** Admin/Seed Import (สร้าง+upload+publish, MinIO) | BE-001, INFRA-001 | — |
| 6-B | **BE-010** Publisher Portal API | DB-001, BE-001 | FE-008 |
| 6-C | **BE-011** Admin Approval API | DB-001, BE-010 | FE-009 |
| 6-D | **BE-012** Dashboard & Analytics (aggregation ตรงๆ, ไม่มี read replica/Redis) | BE-003, BE-010, BE-011 | FE-010 |
| 6-E | **FE-008** Publisher Portal UI | BE-010 | — |
| 6-F | **FE-009** Admin Panel UI | BE-011 | — |
| 6-G | **FE-010** Back Office Dashboard UI | BE-012 | — |

---

## Phase 7 — Seed + Smoke Test (ก่อนนำเสนอ)

### ✅ เสร็จเมื่อ
- มีหนังสือ seed **15–30 เล่ม** published พร้อมไฟล์ EPUB จริงบน MinIO เปิดอ่านได้ทุกเล่ม
- มี demo accounts: reader / publisher / admin เตรียมไว้ล่วงหน้า
- เดิน flow demo จบ 1 รอบไม่มี error: register → browse → ซื้อ/เช่า (mock) → อ่าน → wallet → (publisher submit → admin approve)

| Task | หมายเหตุ |
|------|----------|
| **OPS-002** Seed 15–30 เล่ม + demo accounts | สคริปต์สั้น (แทน import 500 เล่ม) |
| **QA-001** Smoke / E2E เส้นทาง demo | ไม่มี coverage gate / load test |

---

## แผนภาพ Dependency (Demo)

```
INFRA-001 (Mongo+MinIO ใน Docker)
   └► DB-001 ─► BE-001
                 ├► BE-002 ‖ FE-001 ─► FE-002
                 ├► BE-003(mock) ─► BE-004 ‖ BE-005
                 │                   └► FE-003 ‖ FE-004 ‖ FE-005
                 ├► BE-008 ‖ FE-006        (Phase 5)
                 │   └► BE-003(update coin) ─► BE-009 ─► FE-007
                 └► BE-007 / BE-010 ─► BE-011 ─► BE-012   (Phase 6)
                          FE-008 / FE-009 / FE-010
   สุดท้าย: OPS-002 (seed) ─► QA-001 (smoke)
```

---

## คู่ที่ทำขนานได้

| คู่ | ช่วง |
|----|------|
| BE-002 + FE-001 | Phase 2 |
| BE-004 + BE-005 | Phase 3 |
| FE-003 + FE-004 + FE-005 | Phase 4 |
| BE-008 + FE-006 | Phase 5 |
| BE-010 + FE-008 / BE-011 + FE-009 / BE-012 + FE-010 | Phase 6 |

---

## งานที่ถูกตัดออกจาก Demo

| Task เดิม | สถานะใน demo |
|----------|--------------|
| **INFRA-002** Payment Gateway Selection | แปลงเป็น **Mock Payment Adapter** (ไม่ต่อ gateway จริง) |
| **BE-006** Rental Expiry Job (BullMQ) | ตัด → lazy expiry check ใน BE-005 |
| **OPS-001** Load Test & Monitoring | ตัด (ไม่จำเป็นต่อการนำเสนอ) |

---

## Out of Scope (เฟสถัดไป)

- Payment gateway จริง, wallet topup เงินจริง, webhook, idempotency แบบ production
- Redis / queue / background job / reconciliation cron
- Read replica / load balancer / monitoring / load test / coverage gate
- Payout อัตโนมัติ, หักภาษี/ใบกำกับ, DRM เต็ม, อ่านออฟไลน์, แอปมือถือ, รีวิว/แนะนำ, rent-to-own
