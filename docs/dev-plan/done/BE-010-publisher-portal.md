# BE-010 — Publisher Portal API

| Field | Value |
|-------|-------|
| สถานะ | done |
| Sprint | 3 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §6,7.8, BackOffice §5,9, FR-11,18 |
| ขึ้นกับ | DB-001, BE-001, INFRA-001(MinIO) |

## Endpoints

```
POST  /api/v1/publisher/books             → 201 { id, status:"draft" }   (Next.js Route Handler)
PATCH /api/v1/publisher/books/:id         → แก้ไขขณะ draft/rejected
POST  /api/v1/publisher/books/:id/upload-url → presigned MinIO PUT URL
POST  /api/v1/publisher/books/:id/submit  → status→pending_review
GET   /api/v1/publisher/books?status=     → หนังสือของฉัน + สถานะ + ยอดขาย
GET   /api/v1/publisher/dashboard?from=&to= → KPI (ยอดขาย/เล่ม/ส่วนแบ่ง)
GET   /api/v1/publisher/revenue?from=&to= → รายละเอียด + ?export=csv
```

## Security (BackOffice §9 — IDOR Prevention)

- [x] **ทุก query ผูก `publisher_id` จาก JWT token เสมอ** — ห้ามรับ publisher_id จาก client
- [x] Role guard: เฉพาะ `role=publisher`
- [x] Export CSV: บันทึก audit_log ว่าใคร export

## งานที่ต้องทำ

- [x] CRUD draft book + PATCH ขณะ draft/rejected
- [x] Upload EPUB via presigned URL
- [x] submit: ตรวจมีไฟล์ EPUB + ราคาครบ → pending_review
- [x] Dashboard query ด้วย MongoDB aggregation ตรง ๆ
- [x] Revenue export CSV
- [x] บันทึก audit_log ทุก submit/price_change

## Definition of Done

- [x] Upload → submit → pending_review flow ครบ
- [x] เรียก dashboard ของ publisher อื่น → 403
- [x] Earnings ตรงกับ SUM(revenue_splits.publisher_share)
- [x] Export CSV ถูกต้อง
