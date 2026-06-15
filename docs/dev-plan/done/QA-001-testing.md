# QA-001 — Test Cases & ข้อระวัง (ครบทุก FR/NFR)

| Field | Value |
|-------|-------|
| สถานะ | done |
| ผู้รับผิดชอบ | QA Team |
| อ้างอิง | `Read24_DevSpec_Full.md` §10–12, `Read24_BackOffice_Spec.md` §9, PRD §12 |
| ขึ้นกับ | BE-001~012, FE-001~010, DB-001, INFRA-001, INFRA-002 |
| Sprint | 1–3 (demo smoke ครอบคลุมทุก sprint) |

---

## 1. ขอบเขตการทดสอบ

### 1.1 ใน scope (demo)

- วงจร E2E หลัก 3 เส้นทาง (ดู §3)
- ทุก FR-1 ถึง FR-20 + Security spot-check + NFR ที่เกี่ยวข้อง
- Mock payment (`INFRA-002`) — `pay()` / `topup()` สำเร็จทันที ไม่มี gateway/webhook จริง
- Lazy expiry สำหรับเช่าหมดอายุ (`BE-005`) — **ไม่ใช้ cron/background job** (`BE-006` ตัดออก)

### 1.2 นอก scope (demo — ทดสอบเมื่อมี gateway จริง)

- Omise/2C2P webhook จริง, 3DS, PromptPay QR จริง
- Idempotency แบบ production ผ่าน webhook ซ้ำ (FR-8 ข้อ webhook ซ้ำ — ทดสอบด้วย mock duplicate call แทน)
- Load test 500–1,000 concurrent (`OPS-001`)
- Rent-to-own / อัปเกรดจากเช่าเป็นซื้อ (รอนโยบาย PRD Q-5)

---

## 2. สภาพแวดล้อม & ข้อมูลทดสอบ

### 2.1 Prerequisites

| รายการ | รายละเอียด |
|--------|------------|
| Seed data | หนังสือ published ≥ 3 เล่ม (มีทั้ง `price_rent` null และไม่ null), draft/suspended ≥ 1 เล่ม |
| บัญชีทดสอบ | `reader@demo.test`, `publisher-a@demo.test`, `publisher-b@demo.test`, `admin@demo.test` |
| Coin packages | อย่างน้อย 1 แพ็ก (coins + bonus) สำหรับ FR-14 |
| MinIO/S3 | EPUB อยู่ private bucket — ไม่มี public URL |

### 2.2 บทบาท (role)

| Role | สิทธิ์หลัก |
|------|------------|
| `reader` | ซื้อ/เช่า/อ่าน/ตะกร้า/wallet |
| `publisher` | `/publisher/*` เท่านั้น |
| `admin` | `/admin/*` เท่านั้น |

---

## 3. Demo E2E Smoke (ต้องผ่าน 100%)

### E2E-1 — ซื้อ/เช่า → อ่าน

```
register/login → browse (published only) → ค้นหา → รายละเอียดเล่ม
→ ซื้อ (mock) → entitlement active → ขอ content-url → อ่าน + บันทึก progress
→ (เล่มอื่น) เช่า (mock) → daysLeft ถูก → อ่านได้
```

### E2E-2 — Wallet → จ่ายเหรียญ

```
login → wallet balance=0 → topup (mock) → balance เพิ่ม coins+bonus
→ POST /orders paymentMethod=coin → ตัดยอด → entitlement → ประวัติ transaction ถูก
```

### E2E-3 — Publisher → Admin → ร้าน

```
login publisher → สร้าง draft → upload EPUB → submit (pending_review)
→ login admin → approve/publish → logout reader → เห็นเล่มในร้าน
```

### Smoke Test Artifacts

Test files written to `/tests/smoke/`:

| File | FR Covered |
|------|------------|
| `auth.smoke.test.ts` | FR-1 |
| `books.smoke.test.ts` | FR-2, FR-3, FR-4 |
| `orders.smoke.test.ts` | FR-5, FR-6, FR-8, FR-10 |
| `wallet.smoke.test.ts` | FR-13, FR-14, FR-15, FR-16 |
| `cart.smoke.test.ts` | FR-19 |
| `backoffice.smoke.test.ts` | FR-11, FR-17, FR-18, FR-20, Security |

Playwright API/E2E suite in `/read24-tests/` (Vitest unit + Playwright API + E2E smoke).

---

## 4. Test Cases รายละเอียด (ตาม FR)

รูปแบบ: **TC-ID** | Priority: P0=critical, P1=high, P2=medium

---

### FR-1 — Authentication

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-FR1-01 | สมัครสมาชิกสำเร็จ | P0 | POST `/auth/register` ด้วย email/password/displayName ถูกต้อง | 201, สร้าง user, password เก็บเป็น Argon2id hash (ไม่ใช่ plain text) |
| TC-FR1-02 | ล็อกอินสำเร็จ | P0 | POST `/auth/login` ด้วย credentials ถูก | 200 + access token + refresh cookie (httpOnly) |
| TC-FR1-03 | ต่ออายุ token | P1 | POST `/auth/refresh` ด้วย cookie ถูกต้อง | 200 + access token ใหม่ |
| TC-FR1-04 | รหัสผิด | P0 | login ด้วย password ผิด | 401 `INVALID_CREDENTIALS` |
| TC-FR1-05 | Token หมดอายุ | P1 | เรียก protected route ด้วย access token หมดอายุ | 401 `TOKEN_EXPIRED` |
| TC-FR1-06 | GET /me | P1 | เรียกด้วย token ถูกต้อง | คืน profile + role |

**ข้อระวัง FR-1**

- ห้าม log password หรือ JWT secret ใน log
- ห้ามเก็บ `password_hash` แบบ reversible
- Email ซ้ำต้อง reject (409 หรือ 400 ตาม implementation)
- ทุก protected route ต้องผ่าน JWT middleware — ห้ามมี endpoint ลืม guard

---

### FR-2 — รายการหนังสือ (Catalog)

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-FR2-01 | แสดงเฉพาะ published | P0 | GET `/books` | มีเฉพาะ `status=published`; ไม่มี draft/pending_review/suspended |
| TC-FR2-02 | รายละเอียด published | P0 | GET `/books/:id` เล่ม published | 200 + ราคาซื้อ/เช่า |
| TC-FR2-03 | รายละเอียด non-published | P0 | GET `/books/:id` เล่ม draft/suspended | 404 `BOOK_NOT_FOUND` |
| TC-FR2-04 | Pagination | P2 | GET `/books?cursor=&limit=20` | ได้ items + nextCursor ถูกต้อง |

**ข้อระวัง FR-2**

- ห้าม leak metadata ของเล่มที่ยังไม่ publish ผ่าน list/detail API
- `epub_key` / path ไฟล์จริง ห้ามอยู่ใน response รายการ

---

### FR-3 — ค้นหา

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-FR3-01 | ค้นหาเจอ | P0 | GET `/books?q=<title>` ที่มีใน seed | ได้ผลลัพธ์ที่ตรง |
| TC-FR3-02 | ค้นหาไม่เจอ | P1 | GET `/books?q=xyznotexist999` | 200 + items=[] |
| TC-FR3-03 | ค้นหาเฉพาะ published | P0 | ค้นหาชื่อเล่ม draft | ไม่ปรากฏในผลลัพธ์ |

**ข้อระวัง FR-3**

- ใช้ MongoDB text index บน `title, author` — ทดสอบทั้งภาษาไทยและอังกฤษ
- ป้องกัน regex injection ถ้าใช้ `$regex` — ควร escape input

---

### FR-4 — ปุ่มเช่า

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-FR4-01 | เล่มเช่าได้ | P0 | เปิด detail เล่มที่ `price_rent` มีค่า | แสดงปุ่มซื้อ + เช่า |
| TC-FR4-02 | เล่มเช่าไม่ได้ | P0 | เปิด detail เล่มที่ `price_rent=null` | มีปุ่มซื้อเท่านั้น ไม่มีปุ่มเช่า |
| TC-FR4-03 | API เช่าเล่มที่เช่าไม่ได้ | P0 | POST `/orders` type=rent บนเล่ม `price_rent=null` | 400 `RENT_NOT_AVAILABLE` |

---

### FR-5 — ซื้อขาด

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-FR5-01 | ซื้อ mock สำเร็จ | P0 | POST `/orders` type=buy, paymentMethod=mock | order=paid, entitlement type=own, ไม่มี expires_at |
| TC-FR5-02 | ซื้อซ้ำ | P1 | ซื้อเล่มที่ own แล้วอีกครั้ง | 409 `DUPLICATE_ENTITLEMENT` หรือ business rule ที่กำหนด |
| TC-FR5-03 | ชั้นหนังสือ | P0 | GET `/library` หลังซื้อ | เล่มอยู่ในกลุ่ม owned |

**ข้อระวัง FR-5**

- ทุก entitlement ต้องมี `order_id` อ้างอิง (NFR-5)
- สร้าง `revenue_split` ทุก order_item ที่ paid

---

### FR-6 — เช่า

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-FR6-01 | เช่า mock สำเร็จ | P0 | POST `/orders` type=rent | entitlement type=rent, `expires_at = paid_at + rent_days` (default 7d) |
| TC-FR6-02 | daysLeft ถูก | P1 | GET `/library` หลังเช่า | แสดงวันคงเหลือตรงกับ `expires_at - now()` |
| TC-FR6-03 | rent_days custom | P2 | เล่มที่ตั้ง `rent_days=14` | expires_at ตรงตามค่าที่ตั้ง |

---

### FR-7 — เช่าหมดอายุ

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-FR7-01 | Lazy expiry ตอนอ่าน | P0 | ตั้ง `expires_at` ในอดีต (seed/fixture) → GET content-url | 403 `NO_ENTITLEMENT` ทันที |
| TC-FR7-02 | Lazy expiry ตอน list library | P0 | entitlement หมดอายุ → GET `/library` | แสดงในกลุ่ม expired ไม่ใช่ renting |
| TC-FR7-03 | อ่านกลางคืนข้ามวัน | P1 | เช่าแล้วรอจนหมดอายุ (หรือ mock เวลา) → ขอ URL อีกครั้ง | 403 |

**ข้อระวัง FR-7**

- Demo ใช้ **lazy expiry** ใน BE-005 — ไม่รอ cron
- ต้องเช็ก `expires_at` ทุกครั้งที่ออก content-url และ list library (กฎ R-3 ใน PRD)
- อย่าพึ่ง background job อย่างเดียว — ถ้ามี cron ในอนาคต ต้องทดสอบทั้งสองชั้น

---

### FR-8 — การชำระเงิน (Mock)

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-FR8-01 | Mock pay สำเร็จ | P0 | POST `/orders` mock | order=paid + entitlement + revenue_split |
| TC-FR8-02 | Mock pay ล้มเหลว | P1 | จำลอง adapter คืน fail (ถ้ารองรับ) | order=failed, ไม่มี entitlement |
| TC-FR8-03 | เรียกซ้ำไม่สร้างซ้ำ | P0 | ส่ง POST `/orders` เดิมซ้ำ / retry เดิม order | ไม่สร้าง entitlement ซ้ำ, ไม่ตัดเงินซ้ำ |
| TC-FR8-04 | Revenue split ถูก | P0 | หลัง paid | `platform_cut + publisher_share = net` |

**ข้อระวัง FR-8**

- Mock อยู่หลัง `PaymentAdapter` — ทดสอบว่า swap gateway จริงไม่กระทบ caller
- เมื่อมี webhook จริง: ต้องทดสอบ idempotency key / duplicate webhook แยกต่างหาก
- `gateway_fee` ของ mock อาจเป็น 0 หรือค่าคงที่ — ต้องสอดคล้องกับสูตรใน DevSpec §9

---

### FR-9 — ตัวอ่าน & ความคืบหน้า

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-FR9-01 | เปิดอ่าน | P0 | มีสิทธิ์ → GET content-url → เปิด reader | แสดง EPUB ได้ |
| TC-FR9-02 | บันทึก progress | P0 | PUT `/me/progress/:bookId` {cfi, percent} | 204 |
| TC-FR9-03 | โหลด progress | P0 | GET `/me/progress/:bookId` หลังบันทึก | คืน cfi/percent เดิม |
| TC-FR9-04 | เปิดเล่มครั้งแรก | P1 | วัดเวลาเปิดเล่มแรก | ≤ 4s (NFR-1, FE) |
| TC-FR9-05 | ฟอนต์ไทย + mobile | P2 | อ่านบนจอ ≥360px | แสดงผลถูกต้อง (NFR-6) |

---

### FR-10 — ชั้นหนังสือ (Library)

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-FR10-01 | แยก owned | P0 | มีเล่มซื้อ + เช่า + หมดอายุ | 3 กลุ่มแยกชัด |
| TC-FR10-02 | ไม่เห็นของคนอื่น | P0 | user A login → GET `/library` | เห็นเฉพาะ entitlement ของตน |

---

### FR-11 — Publisher upload & submit

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-FR11-01 | สร้าง draft | P0 | POST `/publisher/books` | 201 status=draft |
| TC-FR11-02 | Upload EPUB | P0 | ขอ presigned URL → PUT ไฟล์ → submit | ไฟล์อยู่ MinIO |
| TC-FR11-03 | Submit สำเร็จ | P0 | POST `/publisher/books/:id/submit` | status=pending_review |
| TC-FR11-04 | Submit ไม่ครบ | P1 | submit โดยไม่มี EPUB/ราคา | 400 validation error |
| TC-FR11-05 | แก้หลัง reject | P1 | reject → PATCH → submit ใหม่ | กลับ pending_review |

**ข้อระวัง FR-11**

- Upload ผ่าน presigned URL — ห้ามเปิด bucket public
- ตรวจไฟล์: EPUB เปิดได้, ≤50MB (ตาม DevSpec §16)

---

### FR-12 — ป้องกันเนื้อหา

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-FR12-01 | ไม่มีสิทธิ์ | P0 | GET content-url โดยไม่มี entitlement | 403 `NO_ENTITLEMENT` |
| TC-FR12-02 | ไม่มี public EPUB URL | P0 | ตรวจ response catalog/detail + network tab | ไม่มี direct link ถาวรไป EPUB |
| TC-FR12-03 | Presigned URL หมดอายุ | P1 | ใช้ URL หลัง 15 นาที | 403/AccessDenied จาก storage |
| TC-FR12-04 | ไม่มีปุ่มดาวน์โหลด | P1 | เปิด reader UI | ไม่มี control ดาวน์โหลดไฟล์ดิบ |

**ข้อระวัง FR-12**

- ห้าม expose `epub_key` ใน API response
- Signed URL TTL ≤ 900s (15 นาที)
- เช็ก entitlement **สด** ก่อนออก URL ทุกครั้ง

---

### FR-13 — Wallet เริ่มต้น

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-FR13-01 | Balance เริ่ม 0 | P0 | user ใหม่ → GET `/wallet` | balance=0 |
| TC-FR13-02 | Reconcile balance | P0 | หลัง topup/spend หลายครั้ง | `balance = SUM(wallet_transactions.amount)` |

---

### FR-14 — เติมเหรียญ (Mock topup)

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-FR14-01 | Topup สำเร็จ | P0 | POST `/wallet/topup` {packageId} | coins+bonus เข้าทันที, 2 แถว ledger (topup+bonus) |
| TC-FR14-02 | Topup ล้มเหลว | P1 | จำลอง adapter fail | balance ไม่เปลี่ยน, ไม่มี ledger |
| TC-FR14-03 | balance_after ถูก | P0 | หลัง topup | ทุกแถว ledger มี `balance_after` ตรง |

**ข้อระวัง FR-14**

- Demo: topup สำเร็จทันที (ไม่มี pending state)
- ทุกการเปลี่ยนยอดผ่าน ledger เท่านั้น (NFR-8)

---

### FR-15 — จ่ายด้วยเหรียญ

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-FR15-01 | จ่ายพอ | P0 | balance ≥ ราคา → POST order coin | ตัดยอด, paid, entitlement |
| TC-FR15-02 | จ่ายไม่พอ | P0 | balance < ราคา | 402 `INSUFFICIENT_COINS` |
| TC-FR15-03 | กดรัวไม่ตัดซ้ำ | P0 | ส่ง 5 concurrent POST order เดิม | ตัดครั้งเดียว, entitlement เดียว |
| TC-FR15-04 | ไม่ติดลบ | P0 | balance=10, ซื้อเล่ม 100 | 402, balance ยัง 10 |
| TC-FR15-05 | gateway_fee=0 | P1 | จ่ายเหรียญ | revenue_split.gateway_fee=0 |

**ข้อระวัง FR-15**

- ใช้ atomic: `updateOne({_id, balance:{$gte:amt}}, {$inc:{balance:-amt}})` + เช็ก `modifiedCount`
- ต้อง idempotent ต่อ order — กัน double-spend เมื่อ retry/concurrent
- ห้ามใช้ read-modify-write แบบไม่มี lock

---

### FR-16 — ประวัติ wallet

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-FR16-01 | แสดงประวัติ | P0 | GET `/wallet/transactions` | มี topup/spend/bonus ตามที่เกิด |
| TC-FR16-02 | balance_after chain | P0 | อ่านหลายแถวเรียงเวลา | balance_after ต่อเนื่องถูกต้อง |
| TC-FR16-03 | Pagination | P2 | cursor pagination | nextCursor ทำงาน |

---

### FR-17 — ส่วนแบ่งรายได้ (Admin)

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-FR17-01 | ทุก paid item มี split | P0 | query orders paid | ทุก order_item มี revenue_split |
| TC-FR17-02 | สูตรถูก | P0 | ตรวจแถว split | `platform_cut + publisher_share = net` |
| TC-FR17-03 | Admin dashboard | P0 | GET `/admin/dashboard` | GMV/platformCut/publisherShare ตรง SUM จริง |
| TC-FR17-04 | Export CSV | P1 | GET `/admin/revenue?export=csv` | format ถูก + มี audit_log |

---

### FR-18 — Dashboard สำนักพิมพ์

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-FR18-01 | ตัวเลขตรง | P0 | publisher A ขายได้ X → GET dashboard | myPublisherShare = SUM splits ของ A |
| TC-FR18-02 | เห็นแค่ของตน | P0 | publisher A login | ไม่เห็นยอดของ publisher B |
| TC-FR18-03 | Export CSV ของตน | P1 | export revenue | เฉพาะเล่ม/orders ของตน |

---

### FR-19 — ตะกร้า

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-FR19-01 | เพิ่มเล่ม | P0 | POST `/cart/items` {bookId} | 201, count เพิ่ม |
| TC-FR19-02 | ลบเล่ม | P0 | DELETE `/cart/items/:bookId` | 204 |
| TC-FR19-03 | กันซ้ำ | P1 | เพิ่มเล่มเดิม 2 ครั้ง | 409 `DUPLICATE_CART_ITEM` |
| TC-FR19-04 | เพิ่มเช่า | P0 | POST cart item สำหรับ rent | 400 `CART_BUY_ONLY` |
| TC-FR19-05 | Checkout สำเร็จ | P0 | checkout 3 เล่ม mock/coin | entitlement ครบ 3, cart ว่าง |
| TC-FR19-06 | Checkout ล้มเหลว | P0 | coin ไม่พอ → checkout | 402, cart ยังอยู่ |
| TC-FR19-07 | 1 user 1 cart | P1 | สร้าง cart จาก 2 session | cart เดียว (UNIQUE) |

**ข้อระวัง FR-19**

- Checkout ล้มเหลว → **ห้ามล้างตะกร้า**
- Checkout สำเร็จ → ออก entitlement + revenue_split **ทุก item** แล้วค่อยล้าง

---

### FR-20 — Admin approval & lifecycle

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-FR20-01 | Draft ไม่โผล่ร้าน | P0 | เล่ม draft | ไม่อยู่ใน GET `/books` |
| TC-FR20-02 | Publish | P0 | admin publish | โผล่ร้าน + audit_log |
| TC-FR20-03 | Reject | P1 | admin reject + reason | publisher เห็น reason |
| TC-FR20-04 | Suspend | P0 | suspend เล่มที่มีคนซื้อแล้ว | หายจากร้าน, entitlement เดิมยังอ่านได้ |
| TC-FR20-05 | Audit ทุก action | P0 | publish/reject/suspend/PATCH revenue_share | มีแถวใน audit_logs |
| TC-FR20-06 | FIFO queue | P2 | หลายเล่ม pending_review | เรียง submittedAt |

**ข้อระวัง FR-20**

- Suspend ห้าม revoke entitlement ที่มีอยู่แล้ว
- Publish ต้องตรวจมีไฟล์ EPUB บน MinIO ก่อน

---

## 5. Security & IDOR

| TC-ID | ชื่อ | Priority | ขั้นตอน | ผลที่คาดหวัง |
|-------|------|----------|---------|-------------|
| TC-SEC-01 | Publisher → /admin | P0 | token publisher เรียก `/admin/*` | 403 `FORBIDDEN` |
| TC-SEC-02 | Reader → /publisher | P0 | token reader เรียก `/publisher/*` | 403 |
| TC-SEC-03 | IDOR publisher_id ปลอม | P0 | ส่ง `publisher_id` ของรายอื่นใน body/query | ถูกเพิกเฉย — ใช้จาก JWT เท่านั้น |
| TC-SEC-04 | IDOR book ของ publisher อื่น | P0 | publisher A PATCH book ของ B | 403/404 |
| TC-SEC-05 | IDOR library | P0 | ขอ progress/content ของ user อื่น | 403 |
| TC-SEC-06 | ไม่ส่ง publisher_id จาก FE | P1 | ตรวจ network request backoffice | ไม่มี publisher_id ใน body |
| TC-SEC-07 | HTTPS only | P2 | ตรวจ staging URL | ทุกช่องทาง HTTPS |
| TC-SEC-08 | Secret ไม่ leak | P0 | ตรวจ API response/error | ไม่มี JWT secret, DB URI, S3 key |

**ข้อระวัง Security (สรุป)**

- ทุก query ฝั่ง publisher ผูก `publisher_id` จาก token — **ห้ามรับจาก client** (BackOffice §9)
- ห้าม log PII ที่ไม่จำเป็น (password, full token)
- Presigned URL ต้อง scope เฉพาะ object ที่ขอ

---

## 6. NFR Test Cases

| NFR | TC-ID | เกณฑ์ | วิธีทดสอบ |
|-----|-------|-------|-----------|
| NFR-1 | TC-NFR1-01 | รายการ/รายละเอียด p95 ≤ 2.5s | load tool / manual 10 ครั้ง |
| NFR-1 | TC-NFR1-02 | content-url p95 ≤ 1s | วัดหลังมีสิทธิ์ |
| NFR-1 | TC-NFR1-03 | เปิดเล่มแรก ≤ 4s | FE reader |
| NFR-2 | TC-NFR2-01 | CI รัน test suite ผ่าน | pipeline green |
| NFR-3/5 | TC-NFR5-01 | orders(paid) vs entitlements = 0 mismatch | reconciliation query |
| NFR-4 | TC-NFR4-01 | password = Argon2id | ตรวจ DB ไม่มี plain text |
| NFR-5 | TC-NFR5-02 | ทุก entitlement มี order | query orphan = 0 |
| NFR-5 | TC-NFR5-03 | platform_cut + publisher_share = net | query mismatch = 0 |
| NFR-6 | TC-NFR6-01 | ฟอนต์ไทย จอ ≥360px | manual/visual |
| NFR-7 | TC-NFR7-01 | structured log มี trace/request id | ตรวจ log output |
| NFR-8 | TC-NFR8-01 | wallet balance = SUM(tx) ทุกบัญชี | reconciliation query, ส่วนต่าง=0 |

### Reconciliation Queries (รันหลัง E2E / ก่อน release)

```sql
-- NFR-5: entitlement ไม่มี order รองรับ
SELECT COUNT(*) FROM entitlements e
LEFT JOIN orders o ON e.order_id = o.id
WHERE o.id IS NULL OR o.status <> 'paid';
-- ต้องได้ 0

-- NFR-5: revenue split ไม่ balance
SELECT COUNT(*) FROM revenue_splits
WHERE platform_cut + publisher_share <> net;
-- ต้องได้ 0

-- NFR-8: wallet ไม่ตรง ledger (ปรับตาม schema จริง)
SELECT w.user_id, w.balance, COALESCE(SUM(t.amount),0) AS ledger_sum
FROM wallets w
LEFT JOIN wallet_transactions t ON t.wallet_id = w.id
GROUP BY w.user_id, w.balance
HAVING w.balance <> COALESCE(SUM(t.amount),0);
-- ต้องได้ 0 แถว
```

---

## 7. ข้อระวังรวม (ต้องจำตลอดการทดสอบ)

### 7.1 เงิน & เหรียญ

| # | ข้อระวัง |
|---|---------|
| W-01 | ทุกการเปลี่ยน balance ผ่าน ledger + atomic update — ห้ามแก้ balance ตรงๆ โดยไม่มี transaction row |
| W-02 | ตัดเหรียญต้อง `WHERE balance >= amount` — กันติดลบ |
| W-03 | Order ที่ paid แล้ว ห้ามตัดซ้ำ (idempotency) |
| W-04 | Checkout ล้มเหลว → cart ไม่ล้าง |
| W-05 | จ่ายเหรียญ → `gateway_fee = 0` ใน revenue_split |
| W-06 | รัน reconciliation หลังทุกชุดทดสอบ wallet/payment |

### 7.2 สิทธิ์อ่าน (Entitlement)

| # | ข้อระวัง |
|---|---------|
| W-07 | Entitlement = แหล่งความจริงเดียว — เช็กสดก่อนออก content-url |
| W-08 | Lazy expiry: เช็ก `expires_at` ทั้งตอนอ่านและ list library |
| W-09 | Suspend หนังสือ ห้ามลบ/เพิก entitlement ที่มีอยู่ |
| W-10 | ทุก entitlement ต้องผูก order ที่ paid |

### 7.3 ความปลอดภัย

| # | ข้อระวัง |
|---|---------|
| W-11 | ห้าม public EPUB URL — ใช้ presigned ≤15 นาที |
| W-12 | publisher_id จาก JWT เท่านั้น — ทดสอบ IDOR ทุก sprint |
| W-13 | Role guard ทุก `/admin/*` และ `/publisher/*` |
| W-14 | ห้าม log password, token เต็ม, secret |

### 7.4 Mock vs Production

| # | ข้อระวัง |
|---|---------|
| W-15 | Demo ใช้ mock payment — อย่าสรุปว่า webhook/idempotency production ผ่านแล้ว |
| W-16 | Demo ไม่มี rental cron — ทดสอบ FR-7 ผ่าน lazy expiry เท่านั้น |
| W-17 | เมื่อ swap gateway จริง ต้อง rerun ชุด FR-8, FR-14 แบบ integration |

### 7.5 การทดสอบ

| # | ข้อระวัง |
|---|---------|
| W-18 | Unit test payment/wallet ≥ 80% coverage |
| W-19 | Race condition: ทดสอบ concurrent coin spend / duplicate order |
| W-20 | ใช้ข้อมูล seed แยกต่อ environment — ห้ามทดสอบบน production |
| W-21 | Critical bugs = 0 ก่อน merge sprint |

---

## 8. ลำดับการรัน Test แนะนำ

```
1. Unit tests (payment, wallet, auth, entitlement logic)
2. API integration (ต่อ FR ทีละกลุ่ม)
3. E2E smoke (§3) × 3 วงจร
4. Security spot-check (§5)
5. Reconciliation queries (§6)
6. NFR spot-check (performance sample)
```

---

## 9. Definition of Done

### Demo (ขั้นต่ำ)

- [x] E2E-1, E2E-2, E2E-3 ผ่านครบ 1 รอบ
- [ ] ทุก TC ระดับ P0 ผ่าน
- [x] IDOR spot-check (TC-SEC-01 ถึง TC-SEC-05) ผ่าน
- [ ] Reconciliation NFR-5, NFR-8 = 0 mismatch หลังรัน E2E
- [ ] Critical bugs = 0

### Release-ready (เต็ม)

- [ ] ทุก FR มี test case ครอบคลุม (ตาราง §4)
- [ ] Test suite รันใน CI อัตโนมัติ
- [ ] Unit test coverage payment/wallet ≥ 80%
- [ ] NFR-1 วัด p95 ผ่านเกณฑ์
- [ ] Gateway จริง + webhook idempotency ทดสอบแล้ว (เมื่อมี INFRA-002 production)
- [ ] Load test ตาม OPS-001

---

## 10. อ้างอิง Task ที่เกี่ยวข้อง

| Task | กลุ่มทดสอบหลัก |
|------|----------------|
| BE-001, FE-001 | FR-1, Security auth |
| BE-002, FE-002 | FR-2,3,4 |
| BE-003, FE-003 | FR-5,6,8,17 |
| BE-004, FE-004 | FR-10 |
| BE-005, FE-005 | FR-7,9,12 |
| BE-008, FE-006 | FR-13,14,15,16, NFR-8 |
| BE-009, FE-007 | FR-19 |
| BE-010,11,12 + FE-008,9,10 | FR-11,17,18,20, Security IDOR |
| INFRA-002 | FR-8,14 (mock adapter) |
| OPS-001 | NFR-1, NFR-2 load |
