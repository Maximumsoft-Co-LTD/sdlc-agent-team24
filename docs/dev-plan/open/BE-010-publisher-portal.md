# BE-010 — Publisher Portal API

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 3 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §6,7.8, BackOffice §5,9, FR-11,18 |
| ขึ้นกับ | DB-001, BE-001, INFRA-001(S3) |

## Endpoints

```
POST  /api/v1/publisher/books             → 201 { id, status:"draft" }
PATCH /api/v1/publisher/books/:id         → แก้ไขขณะ draft/rejected
POST  /api/v1/publisher/books/:id/upload-url → presigned S3 PUT URL
POST  /api/v1/publisher/books/:id/submit  → status→pending_review
GET   /api/v1/publisher/books?status=     → หนังสือของฉัน + สถานะ + ยอดขาย
GET   /api/v1/publisher/dashboard?from=&to= → KPI (ยอดขาย/เล่ม/ส่วนแบ่ง)
GET   /api/v1/publisher/revenue?from=&to= → รายละเอียด + ?export=csv
```

## Security (BackOffice §9 — IDOR Prevention)

- [ ] **ทุก query ผูก `publisher_id` จาก JWT token เสมอ** — ห้ามรับ publisher_id จาก client
- [ ] Role guard: เฉพาะ `role=publisher`
- [ ] Export CSV: บันทึก audit_log ว่าใคร export

## งานที่ต้องทำ

- [ ] CRUD draft book + PATCH ขณะ draft/rejected
- [ ] Upload EPUB via presigned URL
- [ ] submit: ตรวจมีไฟล์ EPUB + ราคาครบ → pending_review
- [ ] Dashboard query (อ่านจาก read replica + Redis cache TTL 1–5 นาที)
- [ ] Revenue export CSV
- [ ] บันทึก audit_log ทุก submit/price_change

## Definition of Done

- [ ] Upload → submit → pending_review flow ครบ
- [ ] เรียก dashboard ของ publisher อื่น → 403
- [ ] Earnings ตรงกับ SUM(revenue_splits.publisher_share)
- [ ] Export CSV ถูกต้อง
