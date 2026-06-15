# BE-011 — Admin Approval & Back Office API

| Field | Value |
|-------|-------|
| สถานะ | done |
| Sprint | 3 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §6,7.8, BackOffice §5,7,9, FR-20 |
| ขึ้นกับ | DB-001, BE-001, BE-010 |

## Endpoints

```
GET  /api/v1/admin/dashboard?from=&to=        → KPI ทั้งระบบ (→ BE-012)   (Next.js Route Handler)
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

- [x] Role guard: เฉพาะ `role=admin`
- [x] publish: ตรวจมีไฟล์ EPUB บน MinIO + set published_at
- [x] reject: set status + reason (สำนักพิมพ์เห็นใน GET /publisher/books)
- [x] suspend: status→suspended (**entitlement เดิมไม่กระทบ**)
- [x] บันทึก `audit_logs` + `book_status_history` ทุก transition
- [x] PATCH publishers/:id revenue_share → audit_log (price_change)
- [x] Admin revenue export CSV: บันทึก audit_log ว่าใคร export

## Definition of Done

- [x] Approval queue เรียงตาม submittedAt (FIFO)
- [x] Suspend → book หายจากร้าน แต่ entitlement เดิมใช้ได้
- [x] ทุก action มี audit_log
- [x] Non-admin → 403
