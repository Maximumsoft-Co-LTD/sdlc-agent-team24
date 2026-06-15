# Read24 — Dev Plan (ครบทุก Sprint)

> อ้างอิงจาก `Read24_DevSpec_Full.md` · อัพเดต: 2026-06-15

## โครงสร้าง

```
dev-plan/
├── open/     ← งานที่ยังไม่ได้เริ่ม
├── doing/    ← งานที่กำลังทำอยู่
└── done/     ← งานที่เสร็จแล้ว
```

## รหัส Task

| Prefix | กลุ่มงาน |
|--------|---------|
| `INFRA` | Infrastructure & DevOps |
| `DB` | Database Schema & Migrations |
| `BE` | Backend API (NestJS) |
| `FE` | Frontend (Next.js) |
| `QA` | Testing |
| `OPS` | Operations & Launch Prep |

---

## Sprint 1 — แกนหลัก (FR-1–10, 12, 17)
> ซื้อ + เช่า + อ่าน + จ่ายตรง + ชั้นหนังสือ + กันเข้าถึง + ส่วนแบ่งรายได้

| Task | รายละเอียด | Blocker |
|------|-----------|---------|
| INFRA-001 | Infrastructure Setup | 🔴 บล็อกทุกอย่าง |
| INFRA-002 | Payment Gateway Selection | 🔴 บล็อก BE-003 |
| DB-001 | Schema & Migrations (ครบทุก Sprint) | 🔴 บล็อก BE ทั้งหมด |
| BE-001 | Authentication API | ขึ้นกับ DB-001 |
| BE-002 | Books API | ขึ้นกับ DB-001, BE-001 |
| BE-003 | Orders & Payment API | ขึ้นกับ DB-001, BE-001, INFRA-002 |
| BE-004 | Library API | ขึ้นกับ BE-003 |
| BE-005 | Reader & Content API | ขึ้นกับ BE-003 |
| BE-006 | Rental Expiry Job | ขึ้นกับ DB-001 |
| BE-007 | Admin API (import script) | ขึ้นกับ BE-001 |
| FE-001 | Auth Pages | ขึ้นกับ BE-001 |
| FE-002 | Book Catalog | ขึ้นกับ BE-002 |
| FE-003 | Purchase Flow | ขึ้นกับ BE-003 |
| FE-004 | My Library Page | ขึ้นกับ BE-004 |
| FE-005 | EPUB Reader | ขึ้นกับ BE-005 |

---

## Sprint 2 — เหรียญ + ตะกร้า (FR-13–16, 19 + NFR-8)
> กระเป๋าเหรียญ + เติม + จ่ายด้วยเหรียญ + ตะกร้าจ่ายรวม

| Task | รายละเอียด | ขึ้นกับ |
|------|-----------|---------|
| BE-008 | Wallet & Coins API | DB-001, BE-001, INFRA-002 |
| BE-009 | Cart API | DB-001, BE-003, BE-008 |
| FE-006 | Wallet & Topup Pages | BE-008 |
| FE-007 | Cart & Checkout Pages | BE-009, FE-006 |

---

## Sprint 3 — สำนักพิมพ์ + แอดมิน (FR-11, 18, 20)
> Publisher portal + หน้ารายได้ + Admin approval queue

| Task | รายละเอียด | ขึ้นกับ |
|------|-----------|---------|
| BE-010 | Publisher Portal API | DB-001, BE-001 |
| BE-011 | Admin Approval API | DB-001, BE-010 |
| FE-008 | Publisher Portal Pages | BE-010 |
| FE-009 | Admin Panel Pages | BE-011 |

---

## Cross-Sprint

| Task | รายละเอียด |
|------|-----------|
| QA-001 | Testing (ครบทุก FR-1–20, NFR-8) |
| OPS-001 | Load Testing & Monitoring |
| OPS-002 | Book Import & Launch Prep |

---

## สรุปจำนวน Task

| สถานะ | จำนวน |
|--------|------|
| open | 26 |
| doing | 0 |
| done | 0 |

---

## Open Items ที่ต้องเคาะก่อน Implement

| รหัส | คำถาม | บล็อก |
|------|-------|-------|
| PRD Q-1 | เลือก payment gateway — Omise หรือ 2C2P | INFRA-002, BE-003 |
| PRD Q-5 | นโยบาย rent-to-own credit (หักค่าเช่าคืนเท่าไร) | BE-011 |
| PRD Q-6 | อัตรา/แพ็กเกจเหรียญ (seed data) | BE-008 |
| PRD Q-8 | นโยบายคืนเหรียญ / วันหมดอายุเหรียญ | BE-008 |
