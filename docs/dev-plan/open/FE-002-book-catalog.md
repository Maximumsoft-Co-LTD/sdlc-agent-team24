# FE-002 — Book Catalog Pages (Frontend)

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | Frontend Dev |
| อ้างอิง | DevSpec §6, FR-2, FR-3, FR-4 |
| ขึ้นกับ | BE-002, FE-001 |

## งานที่ต้องทำ

### `/` หรือ `/books` — Book Listing Page
- [ ] แสดงรายการหนังสือ (grid) — cover, title, author, ราคาซื้อ, ราคาเช่า
- [ ] Filter by category (tabs หรือ dropdown)
- [ ] Infinite scroll หรือ Load More (cursor-based pagination)
- [ ] ใช้ `next/image` สำหรับ cover (optimize)
- [ ] Loading skeleton ระหว่างโหลด
- [ ] Server Component สำหรับ initial render (SEO)

### `/books/search` — Search Page
- [ ] Search input พร้อม debounce 300ms
- [ ] แสดงผล / แสดงข้อความ "ไม่พบหนังสือ" ถ้า items=[]
- [ ] URL param: `?q=คำค้น` (shareable link)

### `/books/:id` — Book Detail Page
- [ ] รายละเอียดเล่ม: ชื่อ, ผู้แต่ง, หมวด, เรื่องย่อ, ราคา
- [ ] ปุ่ม "ซื้อ" และ "เช่า 7 วัน" (ถ้า price_rent ≠ null เท่านั้น, FR-4)
- [ ] ถ้าเป็นเจ้าของแล้ว → ปุ่ม "อ่าน" แทน
- [ ] Server Component + generateMetadata สำหรับ SEO

## Definition of Done

- [ ] Listing โหลด ≤ 2.5s (p95)
- [ ] Search ทำงานโดยไม่ต้องกด Enter
- [ ] ปุ่มเช่าไม่โผล่ถ้าเช่าไม่ได้
- [ ] `tsc --noEmit` และ `lint` ผ่าน
