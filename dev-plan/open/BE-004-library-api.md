# BE-004 — Library API

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec §6, FR-10 |
| ขึ้นกับ | DB-001, BE-001, BE-003 |

## Endpoint

```
GET /api/v1/me/library
    → 200 {
        owned:   [{ book, orderId, purchasedAt }],
        renting: [{ book, expiresAt, daysLeft }],
        expired: [{ book, expiresAt }]
      }
```

## งานที่ต้องทำ

- [ ] Query entitlements ของ user แบ่งตาม type + status
  - `type=own, status=active` → owned
  - `type=rent, status=active` → renting + คำนวณ daysLeft
  - `type=rent, status=expired` → expired
- [ ] คำนวณ `daysLeft = ceil((expires_at - now) / 86400)`
- [ ] Join กับ books เพื่อคืนข้อมูลเล่ม (title, coverUrl, author)
- [ ] ไม่คืน epub_key ใน response

## Definition of Done

- [ ] Library แยก owned / renting / expired ถูกต้อง
- [ ] daysLeft แสดงค่าที่ถูกต้อง
- [ ] ซื้อ/เช่าแล้ว โผล่ใน library ทันที (หลัง webhook)
