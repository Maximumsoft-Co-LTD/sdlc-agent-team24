# BE-002 — Books API

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec §6, FR-2, FR-3, FR-4 |
| ขึ้นกับ | DB-001, BE-001 |

## Endpoints

```
GET /api/v1/books?cursor=&limit=20&category=
    → 200 { items:[{id,title,author,coverUrl,priceBuy,priceRent,rentDays}], nextCursor }

GET /api/v1/books/search?q=คำค้น&limit=20
    → 200 { items:[...] }  (ไม่เจอ → items:[])

GET /api/v1/books/:id
    → 200 { ...รายละเอียดเต็ม... }
    → 404 BOOK_NOT_FOUND (ไม่มีเล่ม หรือ status ≠ published)
```

## งานที่ต้องทำ

- [ ] Listing API — cursor-based pagination, filter by category
- [ ] แสดงเฉพาะ `status='published'` ในหน้าร้าน (FR-2)
- [ ] Full-text search ด้วย PostgreSQL GIN index บน title + author (FR-3)
- [ ] Book detail API — คืน null สำหรับ epub_key (ไม่เปิดเผย path)
- [ ] Cache รายการหนังสือ (Redis, TTL 1–5 นาที) เพื่อลด DB load
- [ ] เล่มที่ `price_rent=null` → ต้องไม่แสดงปุ่มเช่า (FR-4)

## Definition of Done

- [ ] Pagination ทำงานถูกต้อง (cursor-based)
- [ ] Search คืนผลเร็ว ≤ 2.5s (p95) ที่ 500 concurrent users (NFR-1)
- [ ] เล่ม draft ไม่โผล่ใน listing หรือ detail (→ 404)
- [ ] Unit test: search เจอ / ไม่เจอ / เล่ม draft
