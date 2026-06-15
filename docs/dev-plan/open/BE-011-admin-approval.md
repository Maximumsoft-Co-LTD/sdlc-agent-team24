# BE-011 — Admin Approval & Back Office API

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 3 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §6,7.8, BackOffice §5,7,9, FR-20 |
| ขึ้นกับ | DB-001, BE-001, BE-010 |

## Endpoints

```
GET  /api/v1/admin/dashboard?from=&to=        → KPI ทั้งระบบ (→ BE-012)
GET  /api/v1/admin/books?status=&publisher=   → ทุกเล่ม + filter
POST /api/v1/admin/books/:id/publish          → เผยแพร่ + audit_log
POST /api/v1/admin/books/:id/reject { reason } → ตีกลับ + audit_log
POST /api/v1/admin/books/:id/suspend          → ระงับ + audit_log
GET  /api/v1/admin/publishers                 → รายชื่อ + revenue_share + stats
PATCH /api/v1/admin/publishers/:id { revenue_share } → ปรับส่วนแบ่ง + audit_log
GET  /api/v1/admin/audit-logs?cursor=&action= → paginated log
GET  /api/v1/admin/revenue?from=&to=&publisher= → ส่วนแบ่งทั้งระบบ + ?export=csv
```

## Status Flow (BackOffice §7)

```
draft → pending_review → published → suspended
                └→ rejected → (แก้แล้ว) → pending_review
```

## งานที่ต้องทำ

- [ ] Role guard: เฉพาะ `role=admin`
- [ ] publish: ตรวจมีไฟล์ EPUB บน S3 + set published_at
- [ ] reject: set status + reason (สำนักพิมพ์เห็นใน GET /publisher/books)
- [ ] suspend: status→suspended (**entitlement เดิมไม่กระทบ**)
- [ ] บันทึก `audit_logs` + `book_status_history` ทุก transition
- [ ] PATCH publishers/:id revenue_share → audit_log (price_change)
- [ ] Admin revenue export CSV: บันทึก audit_log ว่าใคร export

## Definition of Done

- [ ] Approval queue เรียงตาม submittedAt (FIFO)
- [ ] Suspend → book หายจากร้าน แต่ entitlement เดิมใช้ได้
- [ ] ทุก action มี audit_log
- [ ] Non-admin → 403
