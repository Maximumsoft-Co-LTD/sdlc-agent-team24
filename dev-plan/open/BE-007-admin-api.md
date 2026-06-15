# BE-007 — Admin API (Approval & Content Management)

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 1 (import script), 3 (approval flow) |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §6, §7.8, FR-20 |
| ขึ้นกับ | DB-001, BE-001 (role guard) |

## Endpoints

### Sprint 1 — Admin Import (ใช้นำหนังสือเข้าก่อนเปิดพอร์ทัลสำนักพิมพ์)
```
POST /api/v1/admin/books
     { ...metadata } → 201 { id, status:"draft" }

POST /api/v1/admin/books/:id/upload-url
     → 200 { uploadUrl, key }   (presigned S3 PUT URL)

POST /api/v1/admin/books/:id/publish
     → 200 { status:"published" }
```

### Sprint 3 — Approval Queue (FR-20)
```
GET  /api/v1/admin/books?status=pending_review
     → รายการรออนุมัติ + metadata + เวลายื่น

POST /api/v1/admin/books/:id/publish   → เผยแพร่ (draft หรือ pending_review)
POST /api/v1/admin/books/:id/reject    { reason } → ตีกลับ → status='rejected' + แจ้งสำนักพิมพ์
POST /api/v1/admin/books/:id/suspend   → ระงับ (ไม่กระทบสิทธิ์ที่มีอยู่, FR-20)
```

## งานที่ต้องทำ

### Sprint 1
- [ ] Role guard: เฉพาะ `role=admin` (403 FORBIDDEN)
- [ ] สร้าง draft book + ออก presigned S3 PUT URL
- [ ] Publish: ตรวจว่ามีไฟล์ EPUB บน S3 ก่อน
- [ ] Bulk import script: CSV/JSON + EPUB → S3 + DB (idempotent)

### Sprint 3
- [ ] Approval queue: list books ที่ status='pending_review'
- [ ] Reject: เปลี่ยนสถานะ → `rejected` + บันทึก reason
- [ ] Suspend: เปลี่ยน status → `suspended` (หนังสือหายจากร้าน แต่ entitlement ที่มีอยู่ยังใช้ได้)
- [ ] บันทึก `audit_logs` ทุก action (publish/reject/suspend)
- [ ] (Optional) แจ้ง publisher เมื่อ rejected

## Definition of Done

- [ ] Non-admin ถูกบล็อก (403)
- [ ] Publish/Reject/Suspend บันทึก audit_log ครบ
- [ ] Suspend ไม่กระทบ entitlement เดิม (ทดสอบ)
- [ ] Bulk import script รัน idempotent
