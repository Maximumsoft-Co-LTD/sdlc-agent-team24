# Read24 — Priority Plan (ลำดับการพัฒนา)

> อ้างอิง: `Read24_DevSpec_Full.md` §14,17 + `Read24_BackOffice_Spec.md` §11 · อัพเดต: 2026-06-15

## หลักในการจัดลำดับ

1. **Blocker ก่อนเสมอ** — ถ้า Task A รอ Task B → ทำ B ก่อน
2. **Critical Path** — เส้นที่ยาวที่สุด บล็อกทั้งระบบ ต้องเริ่มทันที
3. **ทำขนานได้** — งานที่ไม่ขึ้นกัน ให้วิ่งพร้อมกัน ประหยัดเวลา
4. **Sprint boundary** — Sprint 1 ต้องวงจรสมบูรณ์ก่อนเริ่ม Sprint 2

---

## Critical Path (ห้ามข้าม — ล่าช้าตัวไหนทั้งระบบล่าช้า)

```
INFRA-001 ──► DB-001 ──► BE-001 ──► BE-003 ──► BE-005 ──► FE-005
                                       ▲
                               INFRA-002 (ต้องเคาะ gateway ก่อน)
```

---

## Phase 0 — Prerequisites 🔴 (ทำก่อนทุกอย่าง — วิ่งขนานได้ทั้ง 3)

### 🎯 เป้าหมาย
ทีมทุกคนมี **สภาพแวดล้อมพร้อมทำงาน** และ **คำถามธุรกิจสำคัญได้รับคำตอบ** ก่อนเขียนโค้ดบรรทัดแรก

### ✅ เกณฑ์ว่า Phase 0 เสร็จ
- Dev รัน `docker-compose up` แล้วมี DB + Redis + S3-compatible service ขึ้นมาครบ
- มี sandbox API key ของ payment gateway พร้อมทดสอบ
- ตัดสินใจได้แล้วว่าจะใช้ Omise หรือ 2C2P (Q-1)
- PM ตอบคำถาม Q-5 (rent-to-own), Q-6 (coin packages), Q-8 (นโยบายคืนเหรียญ) เป็นลายลักษณ์อักษร

| Task | ทำโดย | เหตุผลที่ต้องทำก่อน |
|------|--------|-------------------|
| **INFRA-001** Infrastructure Setup | DevOps | บล็อก DB-001 และทุกสิ่ง |
| **INFRA-002** Payment Gateway | PM + DevOps | ขั้นตอนธุรกิจใช้เวลา — เคาะช้า BE-003 ทำไม่ได้ |
| **เคาะ Open Items** Q-1, Q-5, Q-6, Q-8 | PM | gateway, rent-to-own, coin packages, นโยบายคืนเหรียญ |

> ✅ ทำขนาน: INFRA-001 + INFRA-002 + เคาะ Q-1 พร้อมกัน (คนละทีม)

---

## Phase 1 — Database + Auth 🔴 (Sprint 1, Week 1)

### 🎯 เป้าหมาย
วางรากฐานที่ **ทีมทุกคนทำงานบนฐานเดียวกัน** ได้ — schema ถูกต้อง login/logout ทำงาน บทบาท reader/publisher/admin แยกกันชัดเจน

### ✅ เกณฑ์ว่า Phase 1 เสร็จ
- `POST /auth/register` และ `POST /auth/login` คืน JWT ที่ใช้งานได้จริง
- Refresh token ต่ออายุได้อัตโนมัติ
- Role guard บล็อก admin route ถ้าไม่ใช่ admin (ทดสอบแล้ว)
- Migration รัน `up` / `down` ได้ไม่มี error บน local + staging
- ทุกตารางใน Sprint 1–3 มีใน schema แล้ว (เตรียมไว้ล่วงหน้า)

| ลำดับ | Task | ขึ้นกับ | เหตุผล |
|-------|------|---------|--------|
| 1 | **DB-001** Schema & Migrations | INFRA-001 | บล็อก BE ทั้งหมด — ต้องเสร็จก่อนใคร |
| 2 | **BE-001** Authentication + Role Guard | DB-001 | บล็อก FE และ BE ทุกตัวที่ต้องการ token |

> ⚡ DB-001 เสร็จ → BE-001 เริ่มทันที

---

## Phase 2 — Catalog (Sprint 1, Week 1–2)

### 🎯 เป้าหมาย
ผู้ใช้ **เข้าสู่ระบบและเลือกดูหนังสือได้** — เปิดหน้าร้านได้จริง แม้ยังซื้อไม่ได้

### ✅ เกณฑ์ว่า Phase 2 เสร็จ
- หน้า `/login` และ `/register` ทำงานได้บน browser
- หน้ารายการหนังสือแสดงเฉพาะ `status=published` พร้อม filter category
- ค้นหาหนังสือด้วยชื่อ/ผู้แต่ง และดูหน้ารายละเอียดได้
- เล่มที่ `price_rent=null` ไม่แสดงปุ่ม "เช่า"
- หน้าร้านโหลด ≤ 2.5s บน staging

| Task | ขึ้นกับ | ทำขนานกับ |
|------|---------|----------|
| **BE-002** Books API | DB-001, BE-001 | FE-001 |
| **FE-001** Auth Pages | BE-001 | BE-002 |
| **FE-002** Book Catalog | BE-002, FE-001 | — (รอ 2 ตัวข้างบน) |

> ✅ ทำขนาน: BE-002 + FE-001 (คนละทีม)

---

## Phase 3 — Core Transaction 🔴 (Sprint 1, Week 2–3)

### 🎯 เป้าหมาย
ระบบหลังบ้าน **รับเงินได้จริง และออกสิทธิ์อ่านได้ถูกต้อง** — จ่ายแล้วได้สิทธิ์ทันที, เช่าหมดอายุตัดสิทธิ์อัตโนมัติ

### ✅ เกณฑ์ว่า Phase 3 เสร็จ
- `POST /orders` + webhook sandbox → order สถานะ `paid` + entitlement ถูกสร้างใน DB **ครั้งเดียว** (atomic)
- webhook ยิงซ้ำ → ไม่สร้าง entitlement ซ้ำ (idempotency ผ่าน test)
- `GET /books/:id/content-url` คืน presigned URL ≤1s สำหรับ user ที่มีสิทธิ์
- user ที่ไม่มีสิทธิ์ → 403 ทันที (ไม่ต้องรอ cron)
- entitlement ที่เช่าหมดอายุ → ถูกตัดภายใน ≤15 นาที (cron job ทำงาน staging)
- `platform_cut + publisher_share = net` ทุก revenue_split แถวใน DB

| ลำดับ | Task | ขึ้นกับ | ทำขนานกับ |
|-------|------|---------|----------|
| 3-A | **BE-003** Orders & Payment (card/QR) | DB-001, BE-001, INFRA-002 | BE-006 |
| 3-B | **BE-004** Library API | BE-003 | BE-005 |
| 3-C | **BE-005** Reader & Content API | BE-003, INFRA-001(S3) | BE-004 |
| 3-D | **BE-006** Rental Expiry Job | DB-001 | วิ่งพร้อม 3-A ได้ |

> ✅ ทำขนาน: BE-006 คู่กับ BE-003 / BE-004 คู่กับ BE-005

---

## Phase 4 — Frontend Transaction (Sprint 1, Week 3–4)

### 🎯 เป้าหมาย
ผู้ใช้ **ทำวงจรทั้งหมดได้บน browser** โดยไม่ต้องใช้ API client — ค้นหา → เลือก → จ่ายเงิน → อ่านหนังสือในแอป

### ✅ เกณฑ์ว่า Phase 4 เสร็จ
- กด "ซื้อ" หรือ "เช่า" บน book detail → modal ชำระเงินเปิดขึ้น → จ่ายผ่าน sandbox card/QR → หนังสือโผล่ใน library
- หน้า library แสดง owned / renting (พร้อม daysLeft) / expired แยกชัดเจน
- กด "อ่าน" → epub.js โหลด EPUB จาก presigned URL → เปิดอ่านได้ใน ≤4s
- ปิดแล้วเปิดใหม่ → กลับมาหน้าเดิม (CFI บันทึกไว้)
- เช่าหมดอายุ → popup "เช่าอีกครั้ง / ซื้อขาด" แทนที่จะแสดง content

| Task | ขึ้นกับ | ทำขนานกับ |
|------|---------|----------|
| **FE-003** Purchase Flow | BE-003, FE-002 | FE-004, FE-005 |
| **FE-004** My Library | BE-004, FE-001 | FE-003, FE-005 |
| **FE-005** EPUB Reader | BE-005, FE-001 | FE-003, FE-004 |

> ✅ ทำขนาน: FE-003 + FE-004 + FE-005 พร้อมกัน (3 คน 3 งาน)

---

## Phase 5 — Admin Import + QA Sprint 1 (Sprint 1, Week 4)

### 🎯 เป้าหมาย
ร้านมี **หนังสือจริงให้ผู้ใช้เลือก** และ Sprint 1 ผ่านการทดสอบครบทุก requirement — พร้อม demo หรือ soft launch

### ✅ เกณฑ์ว่า Phase 5 เสร็จ
- มีหนังสือ ≥300 เล่ม (เป้า 500) status=published บน staging พร้อมไฟล์ EPUB จริงบน S3
- ทุกเล่ม published เปิดอ่านได้จริงใน epub.js ไม่มีเล่มที่ไฟล์หาย
- E2E test ผ่านครบ: FR-1 (auth), FR-2–4 (catalog), FR-5–8 (buy/rent/pay), FR-9–10 (read/library), FR-12 (no public URL), FR-17 (revenue split)
- unit test coverage ≥80% บน payment + revenue module
- ไม่มี critical bug เปิดค้างอยู่

| Task | ขึ้นกับ | หมายเหตุ |
|------|---------|---------|
| **BE-007** Admin Import API | BE-001, INFRA-001(S3) | สร้าง/upload/publish หนังสือ |
| **OPS-002** Book Import Script | BE-007 | นำหนังสือ ~500 เล่มเข้าระบบ |
| **QA-001** (Sprint 1 scope) | Phase 1–4 | FR-1–10,12,17 |

---

## Phase 6 — Sprint 2: Wallet + ตะกร้า

> เริ่มหลัง Sprint 1 stable

### 🎯 เป้าหมาย
ผู้ใช้ **เติมเหรียญและจ่ายด้วยเหรียญได้** และ **ซื้อหลายเล่มในครั้งเดียว** — ยอดเหรียญต้องแม่นยำ 100% ไม่หาย ไม่งอก ไม่ติดลบ

### ✅ เกณฑ์ว่า Phase 6 เสร็จ
- เติมเหรียญผ่าน card/QR sandbox → coins+bonus เข้า wallet ภายใน ≤10 วิ
- กดเติมรัวหลายครั้ง → เหรียญไม่เข้าซ้ำ (idempotency ผ่าน test)
- ซื้อหนังสือด้วยเหรียญ → wallet ตัดยอดถูก + ได้ entitlement (gateway_fee=0)
- เหรียญไม่พอ → 402 + UI แนะนำเติม/จ่ายตรง
- ตะกร้า: เพิ่มหลายเล่ม → checkout ครั้งเดียว → ได้ entitlement ครบทุกเล่ม
- `wallets.balance = SUM(wallet_transactions.amount)` ทุกบัญชี (reconcile ผ่าน)
- unit test coverage ≥80% บน wallet module

| ลำดับ | Task | ขึ้นกับ | ทำขนานกับ |
|-------|------|---------|----------|
| 6-A | **BE-008** Wallet & Coins API | DB-001, BE-001, INFRA-002 | FE-006 |
| 6-B | **FE-006** Wallet & Topup Pages | BE-008 | BE-009 |
| 6-C | **BE-003 (update)** เพิ่ม coin payment | BE-008 | FE-006 |
| 6-D | **BE-009** Cart API | BE-003(updated), BE-008 | FE-006 |
| 6-E | **FE-007** Cart & Checkout | BE-009, FE-006 | — |

> ✅ ทำขนาน: BE-008 + FE-006 เริ่มพร้อมกัน (ตกลง API contract ก่อน)
> ⚠️ BE-009 ต้องรอ BE-008 เสร็จ (wallet balance check)

---

## Phase 7 — Sprint 3: Back Office (Publisher + Admin + Dashboard)

> ลำดับตาม BackOffice Spec §11

### 🎯 เป้าหมาย
**สำนักพิมพ์อัปโหลดหนังสือเองได้** และ **แอดมินอนุมัติ/ระงับได้** โดยมีบันทึกทุกการกระทำ — ระบบเห็น dashboard ยอดขายและส่วนแบ่งรายได้แบบ real-time

### ✅ เกณฑ์ว่า Phase 7 เสร็จ
- สำนักพิมพ์สร้าง draft → อัปโหลด EPUB → submit → status=pending_review ใน DB
- แอดมินเห็น queue pending_review เรียงตาม FIFO → approve → หนังสือโผล่หน้าร้านทันที
- reject พร้อม reason → สำนักพิมพ์เห็น reason + แก้ไขแล้ว submit ใหม่ได้
- suspend → หนังสือหายจากร้าน แต่ผู้ที่ซื้อแล้วยังเปิดอ่านได้ (entitlement ไม่กระทบ)
- ทุก action (publish/reject/suspend/price_change) มีแถวใน `audit_logs`
- publisher เรียก `/admin/*` หรือ dashboard ของรายอื่น → 403 (IDOR ไม่เกิด)
- admin dashboard แสดง GMV, platform_cut, publisher_share ตรงกับ SUM(revenue_splits)
- Export CSV ของส่วนแบ่งรายได้ดาวน์โหลดได้ถูกต้อง
- Dashboard โหลด ≤2.5s (ใช้ read replica + Redis cache)

| ลำดับ | Task | ขึ้นกับ | ทำขนานกับ |
|-------|------|---------|----------|
| 7-A | **BE-010** Publisher Portal API | DB-001, BE-001 | FE-008 |
| 7-B | **BE-011** Admin Approval API | DB-001, BE-010 | FE-009 |
| 7-C | **BE-012** Back Office Dashboard | DB-001, BE-003, BE-010, BE-011 | FE-010 |
| 7-D | **FE-008** Publisher Portal UI | BE-010 | BE-011, FE-009 |
| 7-E | **FE-009** Admin Panel UI | BE-011 | FE-010 |
| 7-F | **FE-010** Back Office Dashboard UI | BE-012 | — |

> ✅ ทำขนาน: BE-010 + FE-008 / BE-011 + FE-009 / BE-012 + FE-010

**ลำดับ Sprint 3 ตาม BackOffice §11:**
1. Role/guard + audit_logs → (BE-001 ขยาย, DB-001)
2. Publisher Portal: upload+price+submit → **BE-010 + FE-008**
3. Admin Approval: queue+publish/reject/suspend → **BE-011 + FE-009**
4. Dashboard + aggregation queries → **BE-012 + FE-010**
5. Revenue + Export CSV → (รวมใน BE-012 + FE-010)

---

## Phase 8 — Launch Prep (ก่อนเปิดตัว)

### 🎯 เป้าหมาย
พิสูจน์ว่าระบบ **รับโหลดจริงได้** และ **ทุก requirement ผ่านครบ** — ไม่มี surprise หลังเปิดตัว

### ✅ เกณฑ์ว่า Phase 8 เสร็จ (= พร้อมเปิดตัว)
- Load test 500 concurrent users ผ่านทุก SLA: listing ≤2.5s, content-url ≤1s, epub เปิด ≤4s, error rate <0.5%
- Load test 1,000 concurrent users ไม่ crash (อาจช้ากว่า SLA ได้แต่ต้องไม่ down)
- QA ครบทุก FR-1–20 + NFR-8 + IDOR test ผ่าน 100%
- Critical bugs = 0
- Monitoring dashboard + alert ทำงานบน production environment
- Daily reconciliation job รัน staging แล้วไม่พบ mismatch

| Task | เหตุผล |
|------|--------|
| **OPS-001** Load Testing | จำลอง 500–1,000 concurrent users — เงื่อนไขใน PRD §12 |
| **QA-001** (full scope) | ครบทุก FR-1–20, NFR-8 + IDOR tests |

---

## แผนภาพ Dependency ภาพรวม

```
┌─────────── Phase 0 ───────────┐
│ INFRA-001  INFRA-002  Q-1,5,6,8│  ← ทำขนาน
└───────────────────────────────┘
           │
    ┌──────▼──────┐
    │   Phase 1   │  DB-001 → BE-001
    └──────┬──────┘
           │
    ┌──────▼──────────────┐
    │      Phase 2        │  BE-002 ‖ FE-001 → FE-002
    └──────┬──────────────┘
           │
    ┌──────▼──────────────────────────┐
    │          Phase 3                │
    │ BE-003 ‖ BE-006                 │
    │ (รอ BE-003) → BE-004 ‖ BE-005   │
    └──────┬──────────────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │          Phase 4                │
    │ FE-003 ‖ FE-004 ‖ FE-005        │  ← ทำขนาน 3 คน
    └──────┬──────────────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │          Phase 5                │
    │ BE-007 → OPS-002 ‖ QA(S1)       │
    └──────┬──────────────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │   Sprint 2 — Phase 6            │
    │ BE-008 ‖ FE-006                 │
    │ BE-009 → FE-007                 │
    └──────┬──────────────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │   Sprint 3 — Phase 7            │
    │ BE-010 ‖ FE-008                 │
    │ BE-011 ‖ FE-009                 │
    │ BE-012 ‖ FE-010                 │
    └──────┬──────────────────────────┘
           │
    ┌──────▼──────┐
    │   Phase 8   │  OPS-001 Load Test + QA Full
    └─────────────┘
```

---

## สรุปสำหรับ Team Lead

### คู่ที่ทำขนานได้ (ประหยัดเวลาสูง)

| คู่ | ช่วง |
|----|------|
| INFRA-001 + INFRA-002 + เคาะ Q-1 | Phase 0 |
| BE-002 + FE-001 | Phase 2 |
| BE-003 + BE-006 | Phase 3 |
| BE-004 + BE-005 | Phase 3 |
| FE-003 + FE-004 + FE-005 | Phase 4 |
| BE-008 + FE-006 | Phase 6 |
| BE-010 + FE-008 | Phase 7 |
| BE-011 + FE-009 | Phase 7 |
| BE-012 + FE-010 | Phase 7 |

### Strict Dependencies (ห้ามข้าม)

```
INFRA-001 → DB-001 → BE-001 → BE-003 → BE-005
INFRA-002 ──────────────────→ BE-003
DB-001 → BE-008 → BE-009
BE-010 → BE-011 → BE-012
```

---

## ความเสี่ยงสำคัญ

| ความเสี่ยง | ผลกระทบ | วิธีลด |
|-----------|---------|--------|
| INFRA-002 ล่าช้า (เคาะ gateway ช้า) | BE-003 ทำไม่ได้ | เคาะ Q-1 ใน Phase 0 คู่กับ INFRA-001 |
| DB-001 schema ผิด | รื้อ migration ยาก | Review ก่อน migrate |
| BE-003 webhook ซับซ้อน | payment ไม่น่าเชื่อถือ | เริ่มเร็ว, test sandbox gateway เร็ว |
| NFR-8 coin ledger เพี้ยน | ยอดเหรียญผิด | reconcile job ตั้งแต่ Day 1 Sprint 2 |
| IDOR (publisher เห็นข้อมูลคนอื่น) | security breach | ผูก publisher_id จาก token ทุก query — BackOffice §9 |
| Dashboard query หนัก | API ช้า | ใช้ read replica + Redis cache ตั้งแต่แรก |

---

## Out of Scope (เฟสถัดไป — ไม่ทำใน Sprint 1–3)

| ฟีเจอร์ | อ้างอิง |
|--------|--------|
| Payout อัตโนมัติให้สำนักพิมพ์ | BackOffice §8 |
| หักภาษี ณ ที่จ่าย / ใบกำกับ | BackOffice §8 |
| Role/permission ละเอียดหลายระดับ | BackOffice §8 |
| DRM เต็มรูปแบบ | DevSpec Full §15 |
| อ่านออฟไลน์ | PRD §7 |
| แอปมือถือ | PRD §7 |
| ระบบรีวิว/แนะนำ | PRD §7 |
| Rent-to-own (รอเคาะนโยบาย Q-5) | BE-011 |
