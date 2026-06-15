# BE-004 — Library API

| Field | Value |
|-------|-------|
| สถานะ | done |
| Sprint | 1 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §6, FR-10 |
| ขึ้นกับ | DB-001, BE-001, BE-003 |

## Endpoint

```
GET /api/v1/me/library   (Next.js Route Handler)
    → { owned:[...], renting:[{book,expiresAt,daysLeft}], expired:[...] }
```

## งานที่ต้องทำ

- [x] Query entitlements แยก owned / renting / expired
- [x] คำนวณ `daysLeft = ceil((expires_at - now) / 86400)`
- [x] Join books (title, coverUrl, author) — ไม่คืน epub_key
- [x] หลังสร้าง order (mock paid) → โผล่ทันที

## Definition of Done

- [x] แยก section ถูกต้อง
- [x] daysLeft ถูก
