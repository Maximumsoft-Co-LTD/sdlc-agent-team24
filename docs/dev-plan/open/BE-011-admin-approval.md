# BE-011 — Admin Approval Queue API

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 3 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §6, §7.8, FR-20 |
| ขึ้นกับ | DB-001, BE-001, BE-010 |

## Endpoints

```
GET  /api/v1/admin/books?status=pending_review
     → { items:[{ id, title, author, publisher, submittedAt, isExclusive }] }

POST /api/v1/admin/books/:id/publish
     → 200 { status:"published", publishedAt }

POST /api/v1/admin/books/:id/reject
     { reason: string }
     → 200 { status:"rejected" }

POST /api/v1/admin/books/:id/suspend
     → 200 { status:"suspended" }
```

## กฎสำคัญ

- Guard: เฉพาะ `role=admin`
- `publish`: ตรวจมีไฟล์ EPUB บน S3 จริงก่อน
- `reject`: บันทึก reason (แสดงใน publisher portal)
- `suspend`: เปลี่ยน status → `suspended` แต่ **entitlement ที่มีอยู่ใช้ต่อได้** (FR-20)
- ทุก action บันทึก `audit_logs` (actor, action, target, note, timestamp)

## งานที่ต้องทำ

- [ ] Role guard admin ทุก endpoint
- [ ] GET pending_review queue + filter/sort by submittedAt
- [ ] Publish: set status + published_at + audit_log
- [ ] Reject: set status + reason + audit_log (+ trigger แจ้ง publisher ถ้ามี)
- [ ] Suspend: set status + audit_log (ไม่แตะ entitlements)
- [ ] Rent-to-own upgrade endpoint (PRD Q-5 — implement หลังเคาะนโยบาย):
  - `POST /api/v1/orders/upgrade-to-own { bookId }` → คิดราคา (price_buy − credit) → จ่าย → ออกสิทธิ์ own

## Definition of Done

- [ ] Admin เห็น queue pending_review
- [ ] Publish → book โผล่หน้าร้าน; Reject → publisher เห็น reason
- [ ] Suspend → book หายจากร้าน แต่คนที่ซื้อแล้วยังเปิดอ่านได้
- [ ] audit_logs บันทึกครบทุก action
