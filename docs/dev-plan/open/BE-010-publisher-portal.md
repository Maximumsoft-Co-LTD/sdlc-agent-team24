# BE-010 — Publisher Portal API

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 3 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §6, §7.8, FR-11, FR-18 |
| ขึ้นกับ | DB-001, BE-001, INFRA-001 (S3) |

## Endpoints

```
POST /api/v1/publisher/books
     { title, author, description, category, priceBuy, priceRent, rentDays,
       isExclusive, territory:"TH" }
     → 201 { id, status:"draft" }                                            (FR-11)

POST /api/v1/publisher/books/:id/upload-url
     → 200 { uploadUrl, key }   (presigned S3 PUT URL)

POST /api/v1/publisher/books/:id/submit
     → 200 { status:"pending_review" }   (ส่งให้แอดมินรีวิว)

GET  /api/v1/publisher/books
     → { items:[{ id, title, status, submittedAt, publishedAt, rejectionReason }] }

GET  /api/v1/publisher/earnings?from=&to=
     → { totalNet, totalPublisherShare, items:[{ book, grossSales, publisherShare, period }] }
     (FR-18 — เห็นเฉพาะ publisher_id ของตน)
```

## กฎสำคัญ

- Guard: เฉพาะ `role=publisher` (403 FORBIDDEN)
- Publisher เห็นเฉพาะหนังสือ/รายได้ของ `publisher_id` ตน
- Status flow: `draft` → (submit) → `pending_review` → (admin) → `published` หรือ `rejected`
- หนังสือที่ถูก `rejected` → publisher แก้ไขและ submit ใหม่ได้

## งานที่ต้องทำ

### FR-11 — อัปโหลดหนังสือ
- [ ] Role guard `publisher` ทุก endpoint
- [ ] สร้าง draft book ผูกกับ `publisher_id` ของ user
- [ ] ออก presigned S3 PUT URL สำหรับอัปโหลด EPUB
- [ ] `submit`: ตรวจว่ามีไฟล์ EPUB บน S3 + ราคาครบ ก่อนเปลี่ยนเป็น pending_review
- [ ] ถ้า rejected → แสดง `rejectionReason` ใน GET /publisher/books

### FR-18 — หน้ารายได้
- [ ] Query revenue_splits ที่ `publisher_id` ตรง + join กับ orders(status=paid)
- [ ] Filter ตาม date range (from/to)
- [ ] สรุปยอดต่อเล่ม + รวม

## Definition of Done

- [ ] Publisher สร้าง → อัปโหลด → submit ได้ครบ flow
- [ ] Non-publisher/admin ถูกบล็อก (403)
- [ ] Earnings ตรงกับ SUM(revenue_splits.publisher_share) ของ publisher นั้น
- [ ] หนังสือ rejected แสดง reason
