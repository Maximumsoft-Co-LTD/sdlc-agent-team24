# BE-006 — Rental Expiry Background Job

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec §2, §7.3, FR-7 |
| ขึ้นกับ | DB-001, INFRA-001 (Redis + BullMQ) |

## งานที่ต้องทำ

- [ ] ตั้ง BullMQ worker แยกจาก API server
- [ ] Cron job ทุก **15 นาที** (RENTAL_EXPIRY_CRON=`*/15 * * * *`)
- [ ] Query: `entitlements WHERE type='rent' AND status='active' AND expires_at <= now()`
- [ ] Update status → `expired` (batch update)
- [ ] ใช้ index `entitlements(status, expires_at)` สำหรับ scan เร็ว
- [ ] Log จำนวน entitlements ที่ expire แต่ละรอบ

## หมายเหตุสำคัญ

> Job นี้รับประกันตัดสิทธิ์ภายใน **1 ชั่วโมง** แต่ BE-005 ตรวจสดเพิ่มเติม เพื่อกันพลาดตาม PRD R-3
> ดังนั้น job นี้ไม่ใช่ single point of failure สำหรับ security

## Definition of Done

- [ ] Job รัน every 15 นาทีใน staging
- [ ] Entitlements ที่เลยกำหนด → status=expired ใน ≤ 15 นาที
- [ ] Log บันทึกจำนวนที่ expire แต่ละ cycle
- [ ] ทดสอบโดยตั้ง expires_at เป็นอดีต แล้วรอ job รัน
