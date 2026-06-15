# FE-008 — Publisher Portal (Frontend)

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 3 |
| ผู้รับผิดชอบ | Frontend Dev |
| อ้างอิง | DevSpec Full §6, §7.8, FR-11, FR-18 |
| ขึ้นกับ | BE-010, FE-001 |

## งานที่ต้องทำ

### `/publisher/books` — รายการหนังสือของฉัน
- [ ] ตาราง: title, status (badge สีตาม status), submittedAt, publishedAt
- [ ] Status badge: draft (grey) / pending_review (yellow) / published (green) / rejected (red) / suspended (orange)
- [ ] ปุ่ม "เพิ่มหนังสือใหม่" → `/publisher/books/new`
- [ ] ถ้า rejected → แสดง rejection reason + ปุ่ม "แก้ไขและส่งใหม่"

### `/publisher/books/new` และ `/publisher/books/:id/edit` — ฟอร์มหนังสือ
- [ ] ฟิลด์: title, author, description, category, priceBuy, priceRent (optional), rentDays, isExclusive
- [ ] อัปโหลดปก (cover image preview)
- [ ] อัปโหลดไฟล์ EPUB → เรียก `/publisher/books/:id/upload-url` → PUT ขึ้น S3 โดยตรง
- [ ] Progress bar การอัปโหลด
- [ ] ปุ่ม "บันทึก Draft" และ "ส่งให้รีวิว" (submit)

### `/publisher/earnings` — หน้ารายได้ (FR-18)
- [ ] สรุปรายได้รวม: gross, publisher_share
- [ ] Filter ตาม date range
- [ ] ตารางรายได้ต่อเล่ม: ชื่อหนังสือ, จำนวนขาย, ยอดรวม, ส่วนแบ่งที่ได้

## Definition of Done

- [ ] Publisher upload → submit → เห็นสถานะ pending_review
- [ ] หลัง admin publish → สถานะ published
- [ ] หลัง admin reject → เห็น reason + แก้ไขและ resubmit ได้
- [ ] Earnings ตรงกับ BE
- [ ] `tsc --noEmit` และ `lint` ผ่าน
