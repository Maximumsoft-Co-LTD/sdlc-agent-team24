# BE-005 — Reader & Content API

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 1 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §6,7.2,8, FR-9,12 |
| ขึ้นกับ | DB-001, BE-001, BE-003, INFRA-001(MinIO) |

## Endpoints

```
GET /api/v1/books/:id/content-url → { url, expiresIn:900 } / 403 NO_ENTITLEMENT   (Next.js Route Handler)
GET /api/v1/me/progress/:bookId   → { cfi, percent }
PUT /api/v1/me/progress/:bookId   { cfi, percent } → 204
```

## งานที่ต้องทำ

- [ ] เช็ก entitlement สด (active + ไม่หมดอายุ) ก่อนออก URL
- [ ] **Lazy expiry**: เช็ก `expires_at` ตอนออก content-url และตอน list library — ถ้าหมดอายุ → ถือว่า expired (แทน background job BE-006)
- [ ] ออก MinIO presigned URL อายุ ≤15 นาที
- [ ] Upsert reading_progress (cfi + percent)
- [ ] ไม่มี public EPUB URL

## Definition of Done

- [ ] มีสิทธิ์ → ได้ URL ≤1s (p95, NFR-1)
- [ ] ไม่มีสิทธิ์/หมดอายุ → 403 ทันที
- [ ] Progress บันทึก/โหลดถูก
