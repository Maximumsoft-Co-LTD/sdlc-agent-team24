# BE-002 — Books API

| Field | Value |
|-------|-------|
| สถานะ | done |
| Sprint | 1 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §6, FR-2,3,4 |
| ขึ้นกับ | DB-001, BE-001 |

## Endpoints

```
GET /api/v1/books?cursor=&limit=20&category=  → รายการ (published เท่านั้น)   (Next.js Route Handler)
GET /api/v1/books/search?q=&limit=20          → full-text search
GET /api/v1/books/:id                         → รายละเอียด / 404 ถ้า draft
```

## งานที่ต้องทำ

- [x] Cursor-based pagination
- [x] แสดงเฉพาะ `status='published'` (FR-2)
- [x] Full-text search ด้วย MongoDB text index (FR-3)
- [x] เล่มที่ `price_rent=null` → ไม่แสดงตัวเลือกเช่า (FR-4)
- [x] ไม่คืน `epub_key` ใน response

## Definition of Done

- [x] Listing ≤ 2.5s (p95)
- [x] Draft → 404
- [x] Search เจอ/ไม่เจอ
