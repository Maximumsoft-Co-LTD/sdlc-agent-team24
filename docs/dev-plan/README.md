# Read24 — Dev Plan (ครบทุก Sprint + Back Office)

> อ้างอิง: `Read24_DevSpec_Full.md` + `Read24_BackOffice_Spec.md` · อัพเดต: 2026-06-15

## โครงสร้าง

```
dev-plan/
├── plan/     ← Priority plan และลำดับการพัฒนา
├── open/     ← งานที่ยังไม่ได้เริ่ม
├── doing/    ← งานที่กำลังทำอยู่
└── done/     ← งานที่เสร็จแล้ว
```

## Sprint Overview

| Sprint | ฟีเจอร์ | FR |
|--------|---------|-----|
| 1 | ซื้อ+เช่า+อ่าน+จ่ายตรง+ชั้นหนังสือ+ส่วนแบ่ง | FR-1–10,12,17 |
| 2 | เหรียญ+เติม+จ่ายเหรียญ+ตะกร้า | FR-13–16,19,NFR-8 |
| 3 | Publisher Portal+Admin Approval+Back Office Dashboard | FR-11,18,20 |

## Tasks ทั้งหมด (28 tasks)

| Task | Sprint | กลุ่ม |
|------|--------|-------|
| INFRA-001 | Pre | Infrastructure |
| INFRA-002 | Pre | Payment Gateway |
| DB-001 | 1 | Database |
| BE-001 | 1 | Auth |
| BE-002 | 1 | Books API |
| BE-003 | 1+2 | Orders & Payment |
| BE-004 | 1 | Library API |
| BE-005 | 1 | Reader API |
| BE-006 | 1 | Rental Expiry Job |
| BE-007 | 1 | Admin Import |
| BE-008 | 2 | Wallet & Coins |
| BE-009 | 2 | Cart |
| BE-010 | 3 | Publisher Portal |
| BE-011 | 3 | Admin Approval |
| BE-012 | 3 | Back Office Dashboard |
| FE-001 | 1 | Auth Pages |
| FE-002 | 1 | Book Catalog |
| FE-003 | 1 | Purchase Flow |
| FE-004 | 1 | Library Page |
| FE-005 | 1 | EPUB Reader |
| FE-006 | 2 | Wallet & Topup |
| FE-007 | 2 | Cart & Checkout |
| FE-008 | 3 | Publisher Portal UI |
| FE-009 | 3 | Admin Panel UI |
| FE-010 | 3 | Back Office Dashboard UI |
| QA-001 | All | Testing |
| OPS-001 | Pre-launch | Load Test & Monitoring |
| OPS-002 | Pre-launch | Book Import |

## สรุปจำนวน

| สถานะ | จำนวน |
|--------|------|
| open | 28 |
| doing | 0 |
| done | 0 |

## Open Items ที่ต้องเคาะก่อน

| รหัส | คำถาม | บล็อก |
|------|-------|-------|
| PRD Q-1 | เลือก gateway (Omise/2C2P) | INFRA-002, BE-003 |
| PRD Q-5 | นโยบาย rent-to-own credit | BE-011 |
| PRD Q-6 | อัตรา/แพ็กเกจเหรียญ | BE-008 |
| PRD Q-8 | นโยบายคืนเหรียญ/วันหมดอายุ | BE-008 |
