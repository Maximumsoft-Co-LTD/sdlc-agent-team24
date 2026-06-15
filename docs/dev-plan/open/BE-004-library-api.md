# BE-004 — Library API

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 1 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §6, FR-10 |
| ขึ้นกับ | DB-001, BE-001, BE-003 |

## Endpoint

```
GET /api/v1/me/library
    → { owned:[...], renting:[{book,expiresAt,daysLeft}], expired:[...] }
```

## งานที่ต้องทำ

- [ ] Query entitlements แยก owned / renting / expired
- [ ] คำนวณ `daysLeft = ceil((expires_at - now) / 86400)`
- [ ] Join books (title, coverUrl, author) — ไม่คืน epub_key
- [ ] หลัง webhook → โผล่ทันที

## Definition of Done

- [ ] แยก section ถูกต้อง
- [ ] daysLeft ถูก
