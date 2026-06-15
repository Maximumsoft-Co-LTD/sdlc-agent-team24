# FE-009 — Admin Panel Pages

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 3 |
| ผู้รับผิดชอบ | Frontend Dev |
| อ้างอิง | BackOffice §3.2, FR-20 |
| ขึ้นกับ | BE-011, FE-001 |

## งานที่ต้องทำ

- [ ] `/admin/books` — ตาราง + filter status/publisher + ปุ่ม publish/reject/suspend
- [ ] Confirmation dialog ก่อนทุก action
- [ ] Reject → กรอก reason ก่อนส่ง
- [ ] `/admin/books/:id` — detail + preview ปก + link EPUB (MinIO presigned URL) + action buttons
- [ ] Status badge ตามสถานะ (สี)
- [ ] Route guard: redirect ถ้า role ≠ admin

## Definition of Done

- [ ] Publish → โผล่หน้าร้าน
- [ ] Suspend → หายจากร้าน แต่ entitlement ไม่กระทบ
- [ ] Non-admin → redirect 403
