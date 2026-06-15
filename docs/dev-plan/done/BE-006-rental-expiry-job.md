# BE-006 — Rental Expiry Background Job

| Field | Value |
|-------|-------|
| สถานะ | done (ตัดออก demo — lazy expiry ใน BE-005) |
| Sprint | 1 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §7.3, FR-7 |
| ขึ้นกับ | DB-001 |

## หมายเหตุ

Background job นี้ **ตัดออกสำหรับ demo** — แทนด้วย **lazy expiry check** ใน BE-005:
เช็ก `expires_at` ตอนออก content-url และตอน list library
ถ้า `type='rent'` และ `expires_at <= now()` → ถือว่า expired ทันที (ไม่ต้องมี worker/cron)

## Definition of Done

- [ ] (ตัดออก) — ทดสอบ lazy expiry ใน BE-005 แทน
