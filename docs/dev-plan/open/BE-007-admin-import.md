# BE-007 — Admin Import API (Sprint 1)

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 1 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §6, BackOffice §5 |
| ขึ้นกับ | DB-001, BE-001, INFRA-001(S3) |

## Endpoints (Sprint 1 — Admin นำเข้าก่อนเปิด Publisher Portal)

```
POST /api/v1/admin/books                 → 201 { id, status:"draft" }
POST /api/v1/admin/books/:id/upload-url  → { uploadUrl, key }
POST /api/v1/admin/books/:id/publish     → { status:"published" }
```

## งานที่ต้องทำ

- [ ] Role guard: เฉพาะ `role=admin`
- [ ] สร้าง draft book + ออก presigned S3 PUT URL
- [ ] Publish: ตรวจมีไฟล์ EPUB บน S3 ก่อน
- [ ] Bulk import script: CSV/JSON + EPUB → S3 + DB (idempotent)

## Definition of Done

- [ ] Admin สร้าง → upload → publish ครบ flow
- [ ] Non-admin → 403
- [ ] Bulk import script รัน idempotent
