# BE-005 — Reader & Content API

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec §6, §7.2, §8, FR-9, FR-12 |
| ขึ้นกับ | DB-001, BE-001, BE-003, INFRA-001 (S3) |

## Endpoints

```
GET /api/v1/books/:id/content-url
    → 200 { url, expiresIn: 900 }      (presigned S3 URL, อายุ ≤15 นาที)
    → 403 NO_ENTITLEMENT               (ไม่มีสิทธิ์ หรือเช่าหมดอายุ)

GET /api/v1/me/progress/:bookId
    → 200 { cfi, percent }

PUT /api/v1/me/progress/:bookId
    { cfi, percent } → 204
```

## งานที่ต้องทำ

### Content URL (FR-9, FR-12)
- [ ] ตรวจ entitlement สด (ไม่ใช่แค่รอ cron job) ก่อนออก URL
  - ถ้าเป็น rent → ตรวจ `expires_at > now()` ด้วย
  - ไม่มี/หมดอายุ → 403 NO_ENTITLEMENT
- [ ] ออก **S3 presigned URL** อายุ ≤ 15 นาที (SIGNED_URL_TTL=900)
- [ ] Rate limit: ≤ 60 ครั้ง / นาที / user (Redis)
- [ ] ไม่มีลิงก์ EPUB สาธารณะ — epub_key ไม่เคยออกไปใน response

### Reading Progress (FR-9)
- [ ] Upsert reading_progress ด้วย (user_id, book_id) เป็น PK
- [ ] บันทึก CFI (Canon Fragment Identifier) + เปอร์เซ็นต์

## Definition of Done

- [ ] มีสิทธิ์ → ได้ presigned URL ที่ใช้งานได้ใน 15 นาที
- [ ] ไม่มีสิทธิ์ → 403 ทันที (ไม่ต้องรอ cron)
- [ ] เช่าหมดอายุ → 403 ทันที (เช็กสด)
- [ ] Progress บันทึก/โหลดถูกต้อง
- [ ] ไม่มี public URL ของ EPUB ใน S3
