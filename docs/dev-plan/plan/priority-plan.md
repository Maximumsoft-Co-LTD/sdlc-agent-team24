# Read24 — Priority Plan (ลำดับการพัฒนา)

> อ้างอิง: `Read24_DevSpec_Full.md` §14, §17 · วันที่: 2026-06-15

## หลักในการจัดลำดับ

1. **Blocker ก่อนเสมอ** — ถ้า Task A ต้องรอ Task B → ทำ B ก่อน
2. **Critical Path** — เส้นทางที่ยาวที่สุดและบล็อกทั้งระบบ ต้องเริ่มทันที
3. **ทำขนานได้** — งานที่ไม่ขึ้นกันให้วิ่งพร้อมกันเพื่อประหยัดเวลา
4. **Sprint boundary** — Sprint 1 ต้องทำงานได้จบวงจร ก่อนเริ่ม Sprint 2

---

## Critical Path (เส้นทางที่ต้องทำตามลำดับ ห้ามข้าม)

```
INFRA-001 → DB-001 → BE-001 → BE-003 → BE-005 → FE-005 (เปิดอ่านได้)
                               ↓
                          INFRA-002 (ต้องเคาะ gateway ก่อน BE-003)
```

> ถ้า task ใดในเส้นนี้ล่าช้า → ทั้งระบบล่าช้า

---

## Phase 0 — Prerequisites 🔴 (ต้องเสร็จก่อนทุกอย่าง)

> ทำพร้อมกันได้ทั้ง 3 task เพราะไม่ขึ้นกัน

| ลำดับ | Task | ทำโดย | เหตุผล |
|-------|------|--------|--------|
| 0-A | **INFRA-001** Infrastructure Setup | DevOps | บล็อก DB-001 และทุกอย่าง — ทีมอื่นรอ |
| 0-B | **INFRA-002** Payment Gateway | PM + DevOps | ต้องเคาะก่อนเริ่ม BE-003; ขั้นตอนธุรกิจใช้เวลา |
| 0-C | **เคาะ Open Items** (PRD Q-1,5,6,8) | PM | Q-1=gateway, Q-5=rent-to-own, Q-6=coin packages, Q-8=นโยบายคืนเหรียญ |

**เป้า:** เสร็จก่อนเริ่ม Sprint 1 development
**ทำขนาน:** 0-A + 0-B + 0-C พร้อมกันได้

---

## Phase 1 — ฐานข้อมูล + Auth 🔴 (Sprint 1, Week 1)

> รอ INFRA-001 → ทำ DB-001 → ทำ BE-001

| ลำดับ | Task | ขึ้นกับ | เหตุผล |
|-------|------|---------|--------|
| 1-A | **DB-001** Schema & Migrations | INFRA-001 | บล็อก BE ทั้งหมด — ต้องเสร็จก่อนใคร |
| 1-B | **BE-001** Authentication API | DB-001 | บล็อก FE ทั้งหมดและ BE ที่ต้องการ token |

**เป้า:** มี DB schema + login/register ทำงานได้
**ทำขนาน:** DB-001 เสร็จแล้ว → BE-001 เริ่มได้ทันที

---

## Phase 2 — Catalog (Sprint 1, Week 1–2)

> รอ BE-001 → ทำ BE-002 + FE-001 ขนานกัน

| ลำดับ | Task | ขึ้นกับ | ทำขนานกับ |
|-------|------|---------|----------|
| 2-A | **BE-002** Books API | DB-001, BE-001 | FE-001 |
| 2-B | **FE-001** Auth Pages | BE-001 | BE-002 |
| 2-C | **FE-002** Book Catalog | BE-002, FE-001 | รอ 2-A + 2-B |

**เป้า:** ผู้ใช้ login และดูรายการหนังสือได้
**ทำขนาน:** BE-002 และ FE-001 วิ่งพร้อมกันได้ (คนละทีม)

---

## Phase 3 — Core Transaction (Sprint 1, Week 2–3) 🔴

> หัวใจของ Sprint 1 — ซื้อ/เช่า/จ่าย/ได้สิทธิ์/อ่าน

| ลำดับ | Task | ขึ้นกับ | หมายเหตุ |
|-------|------|---------|---------|
| 3-A | **BE-003** Orders & Payment (จ่ายตรง) | DB-001, BE-001, INFRA-002 | Sprint 1 ทำเฉพาะ card/QR ก่อน |
| 3-B | **BE-004** Library API | BE-003 | ต้องรอมี entitlement ก่อน |
| 3-C | **BE-005** Reader & Content API | BE-003, INFRA-001(S3) | presigned URL + เช็กสิทธิ์สด |
| 3-D | **BE-006** Rental Expiry Job | DB-001 | วิ่งพร้อม 3-A ได้ — ไม่ขึ้นกัน |

**เป้า:** ซื้อ/เช่า → จ่ายเงิน → ได้สิทธิ์ → ขอ URL อ่านได้
**ทำขนาน:** 3-D (Expiry Job) ทำพร้อม 3-A ได้

---

## Phase 4 — Frontend Transaction (Sprint 1, Week 3–4)

> รอ Phase 3 → ทำ FE พร้อมกันได้ทุกตัว (คนละทีม)

| ลำดับ | Task | ขึ้นกับ | ทำขนานกับ |
|-------|------|---------|----------|
| 4-A | **FE-003** Purchase Flow | BE-003, FE-002 | FE-004, FE-005 |
| 4-B | **FE-004** My Library | BE-004, FE-001 | FE-003, FE-005 |
| 4-C | **FE-005** EPUB Reader | BE-005, FE-001 | FE-003, FE-004 |

**เป้า:** วงจรสมบูรณ์ — ค้นหา → ซื้อ/เช่า → จ่าย → อ่านในแอปได้
**ทำขนาน:** FE-003, FE-004, FE-005 วิ่งพร้อมกันได้ (3 คน 3 งาน)

---

## Phase 5 — Admin Import + QA Sprint 1 (Sprint 1, Week 4)

> ส่วนท้าย Sprint 1 — นำหนังสือเข้า + ทดสอบ

| ลำดับ | Task | ขึ้นกับ | หมายเหตุ |
|-------|------|---------|---------|
| 5-A | **BE-007** Admin API (import script) | BE-001, INFRA-001(S3) | สร้าง draft + upload + publish |
| 5-B | **OPS-002** Book Import Script | BE-007 | นำหนังสือ ~500 เล่มเข้าระบบ |
| 5-C | **QA-001** (Sprint 1 scope) | Phase 1–4 | FR-1–10, 12, 17 |

**เป้า:** มีหนังสือในระบบ + Sprint 1 ทดสอบผ่าน

---

## Phase 6 — Sprint 2: Wallet + ตะกร้า (Sprint 2)

> เริ่มหลัง Sprint 1 stable — BE-008 ก่อน เพราะ BE-009 ต้องการ coin payment

| ลำดับ | Task | ขึ้นกับ | ทำขนานกับ |
|-------|------|---------|----------|
| 6-A | **BE-008** Wallet & Coins API | DB-001, BE-001, INFRA-002 | FE-006 |
| 6-B | **FE-006** Wallet & Topup Pages | BE-008 | BE-009 |
| 6-C | **BE-003** (update) เพิ่ม coin payment | BE-008 | FE-006 |
| 6-D | **BE-009** Cart API | BE-003(updated), BE-008 | FE-006 |
| 6-E | **FE-007** Cart & Checkout Pages | BE-009, FE-006 | — |

**เป้า:** เติมเหรียญ + จ่ายด้วยเหรียญ + ตะกร้าหลายเล่มได้
**ทำขนาน:** BE-008 + FE-006 เริ่มพร้อมกันได้ (API contract ตกลงก่อน)

---

## Phase 7 — Sprint 3: Publisher + Admin (Sprint 3)

> เปิดให้สำนักพิมพ์อัปโหลดเอง + แอดมิน approve

| ลำดับ | Task | ขึ้นกับ | ทำขนานกับ |
|-------|------|---------|----------|
| 7-A | **BE-010** Publisher Portal API | DB-001, BE-001 | FE-008 |
| 7-B | **BE-011** Admin Approval API | DB-001, BE-010 | FE-009 |
| 7-C | **FE-008** Publisher Portal Pages | BE-010 | BE-011, FE-009 |
| 7-D | **FE-009** Admin Panel Pages | BE-011 | — |
| 7-E | **BE-007** (update) Approval Queue | BE-010 | — |

**เป้า:** สำนักพิมพ์ upload → submit → แอดมิน approve → โผล่หน้าร้าน

---

## Phase 8 — Launch Prep (ก่อนเปิดตัว)

> ทำหลัง Sprint 3 stable

| Task | เหตุผล |
|------|--------|
| **OPS-001** Load Testing | จำลอง 500–1,000 concurrent users ก่อนเปิดจริง |
| **QA-001** (full scope) | ครบทุก FR-1–20, NFR-8 |

---

## แผนภาพ Dependency (ภาพรวม)

```
Phase 0         Phase 1       Phase 2          Phase 3               Phase 4
──────────────────────────────────────────────────────────────────────────────
INFRA-001 ──→ DB-001 ──→ BE-001 ──→ BE-002                          FE-003
                                      ↓        BE-003 (จ่ายตรง) ──→ FE-004
INFRA-002 ─────────────────────────────────→    ↓    ↓              FE-005
                                              BE-004 BE-005
                                              BE-006 (ขนาน)

Phase 0: เคาะ Open Items (Q-1,5,6,8)

Sprint 2                           Sprint 3
────────────────────────           ────────────────────────
BE-008 ──→ BE-009                  BE-010 ──→ BE-011
  ↓           ↓                      ↓           ↓
FE-006 ──→ FE-007                  FE-008 ──→ FE-009
BE-003 (+ coin)
```

---

## สรุปลำดับสำหรับทีม Lead

### งานที่ทำขนานได้ (ประหยัดเวลาสูง)

| คู่ที่ทำพร้อมกันได้ | เมื่อไหร่ |
|--------------------|----------|
| INFRA-001 + INFRA-002 + เคาะ Q-1 | Phase 0 |
| BE-002 + FE-001 | Phase 2 |
| BE-003 + BE-006 | Phase 3 |
| FE-003 + FE-004 + FE-005 | Phase 4 |
| BE-008 + FE-006 | Phase 6 |
| BE-010 + FE-008 | Phase 7 |

### งานที่ห้ามข้ามลำดับ (strict dependency)

```
INFRA-001 → DB-001 → BE-001 → BE-003 → BE-005
INFRA-002 ──────────────────→ BE-003
DB-001 → BE-008 → BE-009
BE-010 → BE-011
```

### ความเสี่ยงสูง (ต้องติดตาม)

| ความเสี่ยง | ผลกระทบ | วิธีลด |
|-----------|---------|--------|
| INFRA-002 ล่าช้า (เคาะ gateway ช้า) | BE-003 ทำไม่ได้ | เคาะ Q-1 ใน Phase 0 พร้อม INFRA-001 |
| DB-001 schema ผิด (แก้ทีหลังยาก) | รื้อ migration ทั้งหมด | review ก่อน migrate, ทำ Phase 1 พร้อมกัน |
| BE-003 webhook ซับซ้อน | payment ไม่น่าเชื่อถือ | เริ่มเร็ว, test ด้วย sandbox gateway |
| NFR-8 (coin ledger) ผิดพลาด | ยอดเหรียญเพี้ยน | ทำ reconcile job ตั้งแต่ Day 1 Sprint 2 |
