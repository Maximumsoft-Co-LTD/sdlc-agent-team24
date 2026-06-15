# Read24 — สเปกสำหรับทีมพัฒนา (ฉบับเต็ม ครบทุกฟีเจอร์)

| หัวข้อ | รายละเอียด |
|---|---|
| ประเภทเอกสาร | สเปกเทคนิค / เอกสารส่งต่อทีม Dev — ครอบคลุมทุก requirement (FR-1–20, NFR-1–8) |
| ขอบเขต | ระบบเต็ม: ซื้อ + เช่า + อ่าน + กระเป๋าเหรียญ + ตะกร้า + จ่ายตรง + สำนักพิมพ์ + แอดมิน + ส่วนแบ่งรายได้ |
| ใช้อ่านคู่กับ | `PRD_Read24_MVP.md` (ที่มา/เหตุผล), `Read24_Warm_UI.html` / `Read24.html` (หน้าตา/ของจริง) |
| สเปกย่อย | `Read24_DevSpec_Sprint1.md` = เฉพาะ Sprint 1 (ซื้อ+เช่า+อ่าน) |
| สถานะ | ฉบับร่าง — รอหัวหน้าทีมเทคนิครีวิว |
| วันที่ | 2026-06-15 |

> เอกสารนี้บอก **"ทำยังไง"** ของทั้งระบบ ส่วน **"ทำอะไร/ทำไม"** อยู่ใน PRD — ทุกข้อกำหนดอ้างกลับด้วยรหัส FR-/NFR- · ลำดับการส่งมอบจริงดูหัวข้อ 18

---

## 1. ขอบเขตทั้งระบบ (ทุกฟีเจอร์)

> 📌 **อ่านง่ายๆ:** ครอบคลุมทุกอย่างที่ผู้ใช้, สำนักพิมพ์ และแอดมินต้องใช้ ตั้งแต่ค้นหา-ซื้อ-เช่า-อ่าน ไปจนถึงเติมเหรียญ ตะกร้า หลังบ้านสำนักพิมพ์ และการอนุมัติของแอดมิน

| กลุ่มฟีเจอร์ | ครอบคลุม FR |
|---|---|
| บัญชี/ล็อกอิน | FR-1 |
| รายการหนังสือ + ค้นหา + รายละเอียด | FR-2, FR-3, FR-4 |
| ซื้อขาด / เช่าอ่าน + ตัดสิทธิ์หมดอายุ | FR-5, FR-6, FR-7 |
| ชำระเงิน (บัตร / QR / เหรียญ) | FR-8, FR-15 |
| ตัวอ่าน + กันเข้าถึงเนื้อหา | FR-9, FR-12 |
| ชั้นหนังสือของฉัน | FR-10 |
| กระเป๋าเหรียญ + เติมเหรียญ + ประวัติ | FR-13, FR-14, FR-15, FR-16 |
| ตะกร้า + จ่ายรวมหลายเล่ม | FR-19 |
| ส่วนแบ่งรายได้ทุกคำสั่งซื้อ | FR-17 |
| สำนักพิมพ์: อัปโหลด/ตั้งราคา + หน้ารายได้ | FR-11, FR-18 |
| แอดมิน: อนุมัติ/เผยแพร่/ระงับ | FR-20 |

---

## 2. เทคโนโลยีที่ใช้ (ข้อเสนอ — ปรับได้)

> 📌 **อ่านง่ายๆ:** ชุดเครื่องมือมาตรฐาน เพิ่มส่วนกระเป๋าเงิน (ต้องแม่นยำเรื่องเหรียญ) เป็นพิเศษ

| ส่วน | ตัวเลือก | เหตุผล |
|---|---|---|
| หน้าเว็บ | React + TypeScript (Next.js) responsive | MVP เป็นเว็บก่อน |
| ตัวอ่าน | `epub.js` | แสดง EPUB ผ่านลิงก์ชั่วคราว |
| หลังบ้าน | Node.js + NestJS (REST) | โครงชัด เทสง่าย |
| ฐานข้อมูล | PostgreSQL 15+ | งานเงิน/เหรียญ/สิทธิ์ ต้องเชื่อถือได้ (ACID) |
| ที่เก็บไฟล์ + CDN | S3 + CDN | ไฟล์ EPUB/ปก ผ่านลิงก์ชั่วคราว |
| ล็อกอิน | JWT + Argon2id | NFR-4 |
| จ่ายเงิน | Omise/2C2P (บัตร + QR PromptPay) ผ่าน adapter | **เคาะเจ้าก่อน — PRD Q-1** |
| งานเบื้องหลัง | Redis + BullMQ | ตัดสิทธิ์เช่า, เทียบยอด, แจ้งเตือน |
| มอนิเตอร์ | log + APM | NFR-7 |

---

## 3. ภาพรวมระบบ

> 📌 **อ่านง่ายๆ:** หน้าเว็บ (ฝั่งผู้ใช้/สำนักพิมพ์/แอดมิน) คุยกับหลังบ้าน, ข้อมูลอยู่ใน PostgreSQL, ไฟล์อยู่ S3+CDN, เงิน/เหรียญทำงานแบบล็อกแถวกันยอดเพี้ยน

```
[ เว็บผู้ใช้ ] [ พอร์ทัลสำนักพิมพ์ ] [ หลังบ้านแอดมิน ]
        │              │                  │
        ▼              ▼                  ▼
              [ หลังบ้าน NestJS ]
  ├─ Auth/บัญชี (FR-1)        ├─ Wallet/เหรียญ (FR-13–16)
  ├─ Catalog (FR-2,3,4)       ├─ Cart/ตะกร้า (FR-19)
  ├─ Order/Checkout (FR-5,6,8,15,17)   ├─ Publisher (FR-11,18)
  ├─ Entitlement/สิทธิ์อ่าน (FR-5,6,7,10,12)  ├─ Admin (FR-20)
  └─ Reader/เนื้อหา (FR-9,12) └─ Payment adapter ─► [ เกตเวย์ ] ─(webhook)─► อัปเดต
        │
        ├─► [ PostgreSQL ] (ผู้ใช้, หนังสือ, คำสั่งซื้อ, สิทธิ์, เหรียญ+บัญชีเดินสะพัด, ตะกร้า, ส่วนแบ่ง)
        ├─► [ S3 + CDN ]   (EPUB + ปก ผ่านลิงก์ชั่วคราว)
        └─► [ Redis + ตัวรันงาน ] (ตัดสิทธิ์เช่า, เทียบยอด)
```

**หลักคิด 2 ข้อ:** (1) "สิทธิ์อ่าน" คือแหล่งความจริงเดียวว่าใครอ่านได้ (2) "เหรียญ" ใช้ระบบบัญชีเดินสะพัด (ledger) — ยอดคงเหลือ = ผลรวมรายการเสมอ ห้ามแก้ยอดตรงๆ

---

## 4. โครงสร้างข้อมูล (PostgreSQL)

> 📌 **อ่านง่ายๆ:** นอกจากผู้ใช้/หนังสือ/คำสั่งซื้อ/สิทธิ์ ยังมีตารางกระเป๋าเหรียญ+รายการเดินสะพัด, แพ็กเกจเติม, ตะกร้า, สำนักพิมพ์ และส่วนแบ่งรายได้

### 4.1 บัญชีและเนื้อหา

**users:** id (uuid PK), email (unique), password_hash (Argon2id), display_name, role enum('reader','publisher','admin') default 'reader', publisher_id (uuid FK, null ถ้าไม่ใช่สำนักพิมพ์), created_at

**publishers:** id, name, revenue_share numeric default 0.70 (PRD §9), is_exclusive_default bool, contract_ref, territory default 'TH', created_at

**books:** id, title, author, description, category, cover_url, epub_key (S3, ไม่ public), price_buy int, price_rent int (null=เช่าไม่ได้), rent_days int default 7, publisher_id FK, status enum('draft','pending_review','published','suspended','rejected') default 'draft', is_exclusive bool, created_at, published_at
- index: `(status,category)`, full-text `(title,author)` (FR-3)

### 4.2 คำสั่งซื้อและสิทธิ์ (รองรับหลายเล่ม/ตะกร้า)

**orders (หัวบิล):** id, user_id FK, status enum('pending','paid','failed','refunded') default 'pending', amount_gross int, payment_method enum('card','promptpay','coin'), payment_ref, created_at, paid_at
- รองรับทั้งซื้อเล่มเดียว และตะกร้าหลายเล่ม (ผ่าน order_items)

**order_items (รายการในบิล):** id, order_id FK, book_id FK, type enum('buy','rent'), unit_price int, rent_days int (เฉพาะ rent)
- ตะกร้ารับเฉพาะ type='buy' (PRD A-9); เช่าทำทีละเล่ม

**entitlements (สิทธิ์อ่าน — หัวใจ):** id, user_id FK, book_id FK, order_item_id FK, type enum('own','rent'), status enum('active','expired','revoked') default 'active', expires_at timestamptz null (null=ถาวร, rent=paid_at+rent_days), created_at
- ทุกสิทธิ์ต้องมี order_item รองรับ (NFR-5)
- UNIQUE(user_id, book_id) เฉพาะ status='active' กันสิทธิ์ซ้ำ
- index `(status,expires_at)` ให้ตัวรันงานสแกนเร็ว

**reading_progress:** user_id, book_id, cfi, percent, updated_at — PK(user_id,book_id) (FR-9)

### 4.3 กระเป๋าเหรียญ (FR-13–16, NFR-8)

**wallets:** id, user_id FK UNIQUE, balance int default 0 (เหรียญ), updated_at
**wallet_transactions (บัญชีเดินสะพัด):** id, wallet_id FK, type enum('topup','bonus','spend','refund','adjust'), amount int (+เข้า/−ออก), balance_after int, ref_type enum('topup','order','manual'), ref_id, created_at
- ยอด `wallets.balance` = ผลรวม amount ทุกแถวเสมอ (NFR-8) — มีงานเทียบยอด (reconcile) รายวัน
**coin_packages:** id, coins int, bonus int default 0, price_thb int, active bool (เช่น 50/100/300+15/500+40/1000+120)
**topups (คำสั่งเติม):** id, user_id FK, package_id FK, coins int, bonus int, amount_gross int, status enum('pending','paid','failed'), payment_method enum('card','promptpay'), payment_ref, created_at, paid_at

### 4.4 ตะกร้า (FR-19)
**carts:** id, user_id FK UNIQUE
**cart_items:** id, cart_id FK, book_id FK, UNIQUE(cart_id,book_id) — เฉพาะรายการซื้อขาด

### 4.5 ส่วนแบ่งรายได้ (FR-17)
**revenue_splits:** id, order_item_id FK UNIQUE, gross, gateway_fee, net, platform_cut, publisher_share, publisher_id FK, created_at
- คิดต่อรายการ (order_item) เพื่อแยกตามสำนักพิมพ์
- กฎ: `platform_cut + publisher_share = net` (NFR-5)

### 4.6 บันทึกการกระทำของแอดมิน (FR-20)
**audit_logs:** id, actor_user_id, action (publish/suspend/reject/approve), target_type, target_id, note, created_at

---

## 5. บทบาทและสิทธิ์ (Roles)

> 📌 **อ่านง่ายๆ:** มี 3 บทบาท — ผู้อ่าน, สำนักพิมพ์, แอดมิน แต่ละคนเห็น/ทำได้ต่างกัน

| การทำงาน | reader | publisher | admin |
|---|---|---|---|
| ซื้อ/เช่า/อ่าน/เติมเหรียญ/ตะกร้า | ✅ | ✅ | ✅ |
| อัปโหลดหนังสือ/ตั้งราคา (ของตัวเอง) | — | ✅ (FR-11) | ✅ |
| ดูรายได้ (ของตัวเอง) | — | ✅ (FR-18) | ✅ (ทุกราย) |
| อนุมัติ/เผยแพร่/ระงับหนังสือ | — | — | ✅ (FR-20) |
- guard: token + role; พอร์ทัลสำนักพิมพ์เห็นเฉพาะ `publisher_id` ของตน; แอดมินใช้ `/admin/*`

---

## 6. รายการ API (REST, ขึ้นต้น `/api/v1`)

> 📌 **อ่านง่ายๆ:** จัดกลุ่มตามฟีเจอร์ — ทุก error ตอบ `{ "error": { "code","message" } }`

### บัญชี
```
POST /auth/register / login / refresh                                  (FR-1)
GET  /me                          → โปรไฟล์ + role
```

### รายการหนังสือ
```
GET  /books?cursor=&limit=&category=     → รายการ (เฉพาะ published)     (FR-2)
GET  /books/search?q=                    → ค้นหา                        (FR-3)
GET  /books/:id                          → รายละเอียด (มีราคาซื้อ/เช่า)  (FR-4)
```

### ตะกร้า (FR-19)
```
GET    /cart                       → { items:[{book,unitPrice}], total, count }
POST   /cart/items   { bookId }    → เพิ่ม (ซื้อขาดเท่านั้น, กันซ้ำ)
DELETE /cart/items/:bookId         → ลบ
POST   /cart/checkout { paymentMethod:"coin"|"card"|"promptpay" }
                                   → สร้าง order ครอบคลุมทุกเล่ม + ชำระ  (FR-19,15,8)
```

### สั่งซื้อ/เช่าเล่มเดียว
```
POST /orders   { bookId, type:"buy"|"rent", paymentMethod:"coin"|"card"|"promptpay" }
              → 201 { orderId, amount, payment? }                       (FR-5,6,8,15)
              เช่าเล่มที่เช่าไม่ได้ → 400 RENT_NOT_AVAILABLE
GET  /orders/:id                   → สถานะคำสั่งซื้อ
POST /payments/webhook             → (เกตเวย์) ยืนยันจ่าย → ออกสิทธิ์ + ส่วนแบ่ง (atomic) (FR-8,17)
```

### กระเป๋าเหรียญ (FR-13–16)
```
GET  /wallet                       → { balance }                       (FR-13)
GET  /wallet/transactions?cursor=  → ประวัติเดินสะพัด                   (FR-16)
GET  /coin-packages                → แพ็กเกจเติม
POST /wallet/topup { packageId, paymentMethod:"card"|"promptpay" }
                                   → สร้าง topup + payload จ่าย          (FR-14)
   (เมื่อจ่ายสำเร็จผ่าน webhook → เพิ่มเหรียญ = coins+bonus)
```

### ชั้นหนังสือ / ตัวอ่าน
```
GET  /me/library                   → { owned, renting(+daysLeft), expired }   (FR-10)
GET  /books/:id/content-url        → ลิงก์ชั่วคราว ≤15น. (ต้องมีสิทธิ์)        (FR-9,12)
GET/PUT /me/progress/:bookId       → ความคืบหน้าการอ่าน                        (FR-9)
```

### พอร์ทัลสำนักพิมพ์ (FR-11, FR-18)
```
POST /publisher/books               { ...metadata, prices } → สร้าง draft        (FR-11)
POST /publisher/books/:id/upload-url → ลิงก์อัปโหลด EPUB ขึ้น S3
POST /publisher/books/:id/submit    → ส่งให้แอดมินรีวิว (status→pending_review)
GET  /publisher/books               → หนังสือของฉัน + สถานะ
GET  /publisher/earnings?from=&to=  → ยอดขาย/เล่ม/ส่วนแบ่งที่ได้ (70%)            (FR-18)
```

### แอดมิน (FR-20)
```
GET  /admin/books?status=pending_review   → คิวรออนุมัติ
POST /admin/books/:id/publish             → เผยแพร่
POST /admin/books/:id/reject  { reason }  → ตีกลับ
POST /admin/books/:id/suspend             → ระงับ (ไม่กระทบคนที่ซื้อแล้ว)
```

---

## 7. ขั้นตอนการทำงานสำคัญ (Flows)

> 📌 **อ่านง่ายๆ:** ครอบคลุมทุกเส้นทางจ่ายเงิน — จ่ายตรง, จ่ายด้วยเหรียญ, เติมเหรียญ, ตะกร้า, การเช่าหมดอายุ, เช่าแล้วซื้อต่อ, สำนักพิมพ์อัปโหลด→อนุมัติ

### 7.1 จ่ายตรง (บัตร/QR) — FR-5,6,8,17
1. `POST /orders` → สร้าง order `pending` + รายการจ่ายกับเกตเวย์
2. ผู้ใช้จ่าย → เกตเวย์ยิง webhook
3. ในครั้งเดียว (atomic): order→`paid` → ออกสิทธิ์อ่าน → คำนวณส่วนแบ่ง (มี gateway_fee)
4. จ่ายไม่สำเร็จ → `failed` ไม่ออกสิทธิ์

### 7.2 จ่ายด้วยเหรียญ — FR-15,17,NFR-8
1. `POST /orders` (paymentMethod=coin) → ตรวจยอดเหรียญพอไหม
2. ถ้าพอ: ในทรานแซกชันเดียว **ล็อกแถว wallet** → ตัดเหรียญ (เพิ่มแถว wallet_transactions type='spend') → order `paid` → ออกสิทธิ์ → ส่วนแบ่ง (**gateway_fee=0** เพราะเก็บค่าธรรมเนียมตอนเติมไปแล้ว, PRD A-8)
3. ถ้าไม่พอ → 409 `INSUFFICIENT_COINS` + แนะนำเติม/จ่ายตรง
4. ตัดเหรียญต้อง **idempotent + กันติดลบ** (ใช้ `UPDATE ... SET balance=balance-:amt WHERE balance>=:amt` แล้วเช็ค affected rows; ห้ามตัดซ้ำ)

### 7.3 เติมเหรียญ — FR-14
1. `POST /wallet/topup { packageId }` → สร้าง topup `pending` + payload จ่าย
2. ผู้ใช้จ่าย (บัตร/QR) → webhook → ในครั้งเดียว: topup→`paid` → เพิ่มเหรียญ = coins+bonus (wallet_transactions type='topup'/'bonus') → อัปเดต balance
3. จ่ายไม่สำเร็จ → ยอดไม่เปลี่ยน

### 7.4 ตะกร้า จ่ายรวม — FR-19
1. เพิ่มหลายเล่ม (ซื้อขาด) → `POST /cart/checkout`
2. สร้าง order เดียว + order_items ทุกเล่ม → ชำระ (เหรียญ/บัตร/QR) ครั้งเดียว
3. จ่ายสำเร็จ → ออกสิทธิ์ทุกเล่ม + ส่วนแบ่งต่อรายการ → ล้างตะกร้า

### 7.5 เปิดอ่าน — FR-9,12
ขอ `content-url` → เช็กสิทธิ์ active (เช่าต้องยังไม่หมด) → ได้ลิงก์ ≤15 นาที / ไม่มีสิทธิ์ → 403

### 7.6 การเช่าหมดอายุ — FR-7
- ตัวรันงานทุก 15 นาที: เช่าที่เลยกำหนด → `expired` (ตัดภายใน ≤1 ชม.)
- เช็กสดตอนเปิดอ่านด้วย (กันพลาด R-3) → 403 → เด้ง "เช่าอีกครั้ง/ซื้อขาด"

### 7.7 เช่าแล้วซื้อต่อ (rent-to-own) — จุดขาย PRD §11
- ผู้ใช้ที่มีสิทธิ์เช่า active กด "อัปเกรดเป็นซื้อ" → คิดราคา = price_buy − (ค่าเช่าที่จ่ายไปแล้ว ตามนโยบาย Q-5) → จ่าย → ออกสิทธิ์ own
> **Open (PRD Q-5):** จะหักค่าเช่าคืนเท่าไร — ต้องเคาะนโยบายก่อน implement

### 7.8 สำนักพิมพ์อัปโหลด → แอดมินอนุมัติ — FR-11,20
1. สำนักพิมพ์สร้าง draft + อัปโหลด EPUB + ตั้งราคา → `submit` (pending_review)
2. แอดมินตรวจ (ดูหัวข้อ 17.4) → `publish` หรือ `reject(reason)`
3. หลังเผยแพร่ ถ้ามีปัญหา → `suspend` (ถอดจากหน้าร้าน ไม่กระทบคนที่ซื้อแล้ว)

---

## 8. ความถูกต้องของเหรียญ (NFR-8)

> 📌 **อ่านง่ายๆ:** เหรียญต้องไม่หาย ไม่งอก ไม่ติดลบ ไม่ถูกตัดซ้ำ แม้กดรัวหรือเน็ตหลุด

- ทุกการเปลี่ยนยอดทำผ่าน **บัญชีเดินสะพัด (ledger)** เท่านั้น + อัปเดต balance ในทรานแซกชันเดียว
- ตัดเหรียญแบบมีเงื่อนไข `WHERE balance>=amount` (กันติดลบ) + **idempotency key** ต่อคำสั่งซื้อ (กันตัดซ้ำ)
- งานเทียบยอดรายวัน: `balance == SUM(amount)` ต้องตรงทุกบัญชี (ส่วนต่าง = 0)

---

## 9. การคำนวณส่วนแบ่งรายได้ (FR-17, PRD §9)

> 📌 **อ่านง่ายๆ:** หักค่าธรรมเนียมก่อน แล้วแบ่ง Read24 ~30% / สำนักพิมพ์ ~70% — จ่ายด้วยเหรียญจะไม่มีค่าธรรมเนียมซ้ำ (เก็บตอนเติมแล้ว)

```
gross           = ราคาของรายการนั้น (order_item)
gateway_fee     = (จ่ายตรง) round(gross × GATEWAY_FEE_RATE) ; (จ่ายเหรียญ) = 0   # PRD A-8
net             = gross − gateway_fee
platform_cut    = round(net × (1 − publisher.revenue_share))
publisher_share = net − platform_cut
```
บันทึก `revenue_splits` ต่อ order_item · ตรวจ `platform_cut + publisher_share == net`

---

## 10. รหัส Error มาตรฐาน

| HTTP | code | เมื่อ |
|---|---|---|
| 400 | RENT_NOT_AVAILABLE / VALIDATION_ERROR / CART_BUY_ONLY | ข้อมูลไม่ถูก/เพิ่มเช่าลงตะกร้า |
| 401 | INVALID_CREDENTIALS / TOKEN_EXPIRED | ล็อกอิน |
| 402 | INSUFFICIENT_COINS | เหรียญไม่พอ (FR-15) |
| 403 | NO_ENTITLEMENT / FORBIDDEN | ไม่มีสิทธิ์อ่าน/บทบาทไม่ถึง |
| 404 | BOOK_NOT_FOUND | ไม่มี/ยังไม่เผยแพร่ |
| 409 | DUPLICATE_ENTITLEMENT / DUPLICATE_CART_ITEM | ซ้ำ |
| 500 | INTERNAL | อื่นๆ |

---

## 11. เกณฑ์คุณภาพ/ประสิทธิภาพ (PRD §12)

> 📌 **อ่านง่ายๆ:** เปิดเร็ว, จ่ายแล้วได้สิทธิ์ 100%, เหรียญตรง 100%, บั๊กร้ายแรง = 0

- ความเร็ว p95: รายการ/รายละเอียด ≤ 2.5 วิ · ขอลิงก์อ่าน ≤ 1 วิ · เปิดเล่มแรก ≤ 4 วิ (NFR-1)
- จ่ายแล้วได้สิทธิ์ = 100% · เหรียญเทียบยอดตรง = 100% (NFR-3/5/8)
- บั๊ก Critical = 0 · เทสวงจรหลักผ่าน 100% · ความครอบคลุมเทสโมดูลเงิน/เหรียญ ≥ 80%
- Crash-free ≥ 99.5% (ไต่สู่ 99.85%) · ทุกช่องทาง HTTPS, secret อยู่ใน secret manager

---

## 12. ตารางจับคู่ ข้อกำหนด → การทดสอบ (ครบทุก FR)

| FR | สิ่งที่ต้องทดสอบ |
|---|---|
| FR-1 | สมัคร/ล็อกอิน/ต่ออายุ; รหัสผิด→401 |
| FR-2 | รายการโชว์เฉพาะ published, มีราคาซื้อ/เช่า |
| FR-3 | ค้นหาเจอ/ไม่เจอ (empty) |
| FR-4 | รายละเอียดแสดงปุ่มซื้อ+เช่าแยกชัด; เล่มเช่าไม่ได้ไม่มีปุ่มเช่า |
| FR-5 | ซื้อสำเร็จ→สิทธิ์ถาวรในชั้น |
| FR-6 | เช่าสำเร็จ→สิทธิ์เช่า, หมดอายุ=จ่าย+7วัน, วันคงเหลือถูก |
| FR-7 | เลยกำหนด→อ่านได้ 403; ตัวรันงานเปลี่ยนเป็น expired |
| FR-8 | บัตร/QR สำเร็จ→paid+สิทธิ์; ล้มเหลว→ไม่มีสิทธิ์; webhook ซ้ำไม่ทำซ้ำ |
| FR-9 | เปิดอ่าน+จำหน้าได้ |
| FR-10 | ชั้นแยก เจ้าของ/เช่า/หมดอายุ |
| FR-12 | ไม่มีสิทธิ์ขอ content-url→403; ไม่มีลิงก์ EPUB สาธารณะ |
| FR-13 | กระเป๋าเริ่ม 0, ยอดตรงกับผลรวมรายการ |
| FR-14 | เติมแพ็กเกจ→เหรียญเพิ่ม=coins+bonus ภายใน ≤10วิ; ล้มเหลว→ยอดไม่เปลี่ยน |
| FR-15 | จ่ายด้วยเหรียญพอ→ตัด+ให้สิทธิ์; ไม่พอ→402; กดรัวไม่ตัดซ้ำ/ไม่ติดลบ |
| FR-16 | ประวัติแสดงเติม/ใช้/คืน + ยอดหลังรายการถูก |
| FR-17 | ทุก order_item ที่ paid มีส่วนแบ่ง, ผลรวม=net |
| FR-18 | หน้ารายได้สำนักพิมพ์ตรงกับผลรวม order ของตน |
| FR-19 | ตะกร้าเพิ่ม/ลบ/กันซ้ำ; จ่ายรวม→ได้สิทธิ์ครบทุกเล่ม; เพิ่มเช่า→400 |
| FR-20 | draft ไม่โผล่หน้าร้าน; publish แล้วโผล่; suspend ไม่กระทบคนที่ซื้อแล้ว |
| NFR-8 | เทียบยอดเหรียญทุกบัญชี ส่วนต่าง=0 |

---

## 13. ค่าตั้งค่า/สภาพแวดล้อม (ตัวอย่าง)
```
DATABASE_URL, REDIS_URL
JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, ACCESS_TTL=15m, REFRESH_TTL=30d
S3_BUCKET, S3_REGION, S3_ACCESS_KEY, S3_SECRET, SIGNED_URL_TTL=900
PAYMENT_PROVIDER=omise|2c2p, PAYMENT_PUBLIC_KEY, PAYMENT_SECRET_KEY, PAYMENT_WEBHOOK_SECRET
GATEWAY_FEE_RATE=0.03, DEFAULT_PUBLISHER_SHARE=0.70, COIN_PER_THB=1
RENTAL_EXPIRY_CRON="*/15 * * * *", RECONCILE_CRON="0 3 * * *"
```

---

## 14. ลำดับงาน/สิ่งที่ต้องมีก่อน
1. DevOps: DB + Redis + S3(private) + CDN + staging + CI
2. PM/DevOps: ยืนยันเกตเวย์ (PRD Q-1) + คีย์ทดสอบ
3. Dev: ข้อมูล→ล็อกอิน/role→รายการ→คำสั่งซื้อ+จ่ายตรง+webhook→สิทธิ์+ตัวอ่าน→ตัดสิทธิ์เช่า→**กระเป๋าเหรียญ+เติม+จ่ายเหรียญ→ตะกร้า**→**พอร์ทัลสำนักพิมพ์+รายได้**→**แอดมินอนุมัติ**
4. ทีมเทส: เขียนเทสจากตารางหัวข้อ 12

---

## 15. รองรับคนได้เท่าไรตอนเปิดตัว

> 📌 **อ่านง่ายๆ:** ออกแบบรับคนใช้พร้อมกันช่วงพีค ~500 เผื่อถึง 1,000; ไฟล์หนังสือโหลดผ่าน CDN ลดภาระหลังบ้าน

| ตัวเลข | เป้าเปิดตัว (3 เดือนแรก) | เผื่อรองรับ |
|---|---|---|
| ผู้ใช้สมัครสะสม | ~10,000 | 50,000 |
| ผู้ใช้ต่อวัน | ~1,000 | 5,000 |
| ใช้พร้อมกันช่วงพีค | ~500 | 1,000 |
| คำขอช่วงพีค | ~150/วินาที | 500/วินาที |

ขนาดเริ่มต้น: API 2–3 เครื่อง (stateless, ขยายอัตโนมัติ) · PostgreSQL หลัก+สำรองอ่าน + PgBouncer · Redis 1 · S3+CDN เสิร์ฟไฟล์ · ตัวรันงานแยก
หลักรับโหลด: หลังบ้านไม่เก็บสถานะ · ไฟล์ไม่วิ่งผ่าน API (ผ่าน CDN) · แคชรายการหนังสือ · เขียน DB หนักเฉพาะตอนจ่าย/เติม · **ทดสอบโหลด 500–1,000 คนก่อนเปิด** · เปิดตัวค่อยๆ เป็นกลุ่ม

---

## 16. การรับหนังสือเข้าระบบตอนเปิดตัว

> 📌 **อ่านง่ายๆ:** ตั้งเป้ามีหนังสือ ~500 เล่มไม่ให้ร้านโล่ง; ช่วงแรกแอดมินนำเข้าให้, ต่อไปสำนักพิมพ์อัปโหลดเอง พร้อมตรวจไฟล์ก่อนเผยแพร่

- เป้าวันเปิด: 300–1,000 เล่ม (ตั้ง ~500) เน้นเล่มเช่าได้ + เล่มเจ้าเดียว (PRD §11)
- ช่องทาง: ช่วงแรกแอดมินนำเข้า (bulk import CSV+EPUB) → ต่อมาเปิดพอร์ทัลสำนักพิมพ์ (FR-11)
- ข้อมูลขั้นต่ำ/เล่ม: ชื่อ, ผู้แต่ง, สำนักพิมพ์, หมวด, เรื่องย่อ, ปก, ไฟล์ EPUB, ราคาซื้อ, ราคาเช่า(หรือว่าง), วันเช่า, ข้อมูลสัญญา/สิทธิ์, โหมดขาย, พื้นที่ขาย
- ตรวจไฟล์: EPUB เปิดได้จริง, ไม่มี DRM ภายนอก, ≤50MB, มีปก/สารบัญ, แสดงผลจอเล็กถูก, สแกนไวรัส
- สถานะ: รับเข้า → ตรวจไฟล์ → ตรวจคุณภาพ → เผยแพร่ (ไม่ผ่าน→ตีกลับ; มีปัญหาภายหลัง→ระงับ)

---

## 17. แผนส่งมอบแบ่งตาม Sprint (จับคู่ PRD §7)

> 📌 **อ่านง่ายๆ:** สเปกนี้ครบทุกฟีเจอร์ แต่ลงมือทำเป็นรอบ — เริ่มจากซื้อ+เช่า+อ่าน แล้วค่อยเพิ่มเหรียญ/ตะกร้า แล้วค่อยเปิดให้สำนักพิมพ์

| Sprint | ฟีเจอร์ | FR |
|---|---|---|
| 1 — แกนหลัก | ซื้อ+เช่า+อ่าน + จ่ายตรง (บัตร/QR) + ชั้นหนังสือ + กันเข้าถึง + ส่วนแบ่ง | FR-1–10,12,17 |
| 2 — เหรียญ+ตะกร้า | กระเป๋าเหรียญ+เติม+จ่ายเหรียญ + ตะกร้าจ่ายรวม | FR-13–16,19 + NFR-8 |
| 3 — สำนักพิมพ์+แอดมิน | พอร์ทัลอัปโหลด/ตั้งราคา + หน้ารายได้ + แอดมินอนุมัติ/ระงับ | FR-11,18,20 |

> เรื่องต้องเคาะก่อนเริ่ม: เกตเวย์จ่ายเงิน (Q-1), นโยบาย rent-to-own (Q-5), อัตรา/แพ็กเกจเหรียญ (Q-6), นโยบายคืนเหรียญ/วันหมดอายุ (Q-8)
