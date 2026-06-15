# BE-007 — Admin Import API (Sprint 1)

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 1 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §6, BackOffice §5 |
| ขึ้นกับ | DB-001, BE-001, INFRA-001(MinIO) |

## Endpoints (Sprint 1 — Admin นำเข้าก่อนเปิด Publisher Portal)

```
POST /api/v1/admin/books                 → 201 { id, status:"draft" }   (Next.js Route Handler)
POST /api/v1/admin/books/:id/upload-url  → { uploadUrl, key }
POST /api/v1/admin/books/:id/publish     → { status:"published" }
```

## งานที่ต้องทำ

- [ ] Role guard: เฉพาะ `role=admin`
- [ ] สร้าง draft book + ออก presigned MinIO PUT URL
- [ ] Publish: ตรวจมีไฟล์ EPUB บน MinIO ก่อน
- [ ] Seed/import script: CSV/JSON + EPUB → MinIO + DB (idempotent) — ใช้เป็นช่อง seed หนังสือ demo ~15–30 เล่ม

## Definition of Done

- [ ] Admin สร้าง → upload → publish ครบ flow
- [ ] Non-admin → 403
- [ ] Seed/import script รัน idempotent (~15–30 เล่ม)
