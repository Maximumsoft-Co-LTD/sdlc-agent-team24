# FE-009 — Admin Panel Pages

| Field | Value |
|-------|-------|
| สถานะ | done |
| Sprint | 3 |
| ผู้รับผิดชอบ | Frontend Dev |
| อ้างอิง | BackOffice §3.2, FR-20 |
| ขึ้นกับ | BE-011, FE-001 |

## งานที่ต้องทำ

- [x] `/admin/books` — ตาราง + filter status/publisher + ปุ่ม publish/reject/suspend
- [x] Confirmation dialog ก่อนทุก action
- [x] Reject → กรอก reason ก่อนส่ง
- [x] `/admin/books/:id` — detail + preview ปก + link EPUB (MinIO presigned URL) + action buttons
- [x] Status badge ตามสถานะ (สี)
- [x] Route guard: redirect ถ้า role ≠ admin

## Definition of Done

- [x] Publish → โผล่หน้าร้าน
- [x] Suspend → หายจากร้าน แต่ entitlement ไม่กระทบ
- [x] Non-admin → redirect 403
