# BE-006 — Rental Expiry Background Job

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 1 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §7.3, FR-7 |
| ขึ้นกับ | DB-001, INFRA-001(Redis+BullMQ) |

## งานที่ต้องทำ

- [ ] BullMQ worker แยกจาก API
- [ ] Cron ทุก 15 นาที (`*/15 * * * *`)
- [ ] UPDATE entitlements SET status='expired' WHERE type='rent' AND status='active' AND expires_at <= now()
- [ ] ใช้ index `(status, expires_at)` สแกนเร็ว
- [ ] Log จำนวนที่ expire แต่ละรอบ

> BE-005 เช็กสดเพิ่มเติม — job นี้ไม่ใช่ single point of failure

## Definition of Done

- [ ] Job รัน staging ทุก 15 นาที
- [ ] Entitlements หมดอายุ ≤15 นาที
