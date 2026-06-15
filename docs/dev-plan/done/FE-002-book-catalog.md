# FE-002 — Book Catalog Pages

| Field | Value |
|-------|-------|
| สถานะ | done |
| Sprint | 1 |
| ผู้รับผิดชอบ | Frontend Dev |
| อ้างอิง | FR-2,3,4 |
| ขึ้นกับ | BE-002, FE-001 |

## งานที่ต้องทำ

- [ ] `/books` — Book listing grid + category filter + infinite scroll/Load More
- [ ] Loading skeleton + `next/image` สำหรับ cover
- [ ] Server Component สำหรับ initial render (SEO)
- [ ] `/books/search?q=` — search input debounce 300ms + shareable URL
- [ ] `/books/:id` — detail: cover, ราคา, ปุ่มซื้อ/เช่า
- [ ] ปุ่มเช่าซ่อนถ้า price_rent=null (FR-4)
- [ ] ถ้าเป็นเจ้าของแล้ว → ปุ่ม "อ่าน" แทน

## Definition of Done

- [ ] Listing โหลด ≤ 2.5s
- [ ] Draft → 404
- [ ] ปุ่มเช่าไม่โผล่ถ้าเช่าไม่ได้
