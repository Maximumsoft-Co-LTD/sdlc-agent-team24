# FE-008 — Publisher Portal Pages

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 3 |
| ผู้รับผิดชอบ | Frontend Dev |
| อ้างอิง | BackOffice §3.4, FR-11,18 |
| ขึ้นกับ | BE-010, FE-001 |

## งานที่ต้องทำ

- [ ] `/publisher/books` — ตาราง + status badge + ปุ่มเพิ่มใหม่
- [ ] Rejection reason แสดงชัดเจน + ปุ่ม "แก้ไขและส่งใหม่"
- [ ] `/publisher/books/new` + `/edit/:id` — ฟอร์ม metadata + อัปโหลดปก + EPUB (progress bar)
- [ ] ตัวคำนวณส่วนแบ่งสด: ใส่ราคา → โชว์ publisher ได้ / Read24 ได้ (BackOffice §3.2)
- [ ] ปุ่ม "บันทึก Draft" + "ส่งให้รีวิว"
- [ ] `/publisher/revenue` — ยอดขาย/เล่ม/ส่วนแบ่ง + date filter + Export CSV

## Definition of Done

- [ ] Upload → submit → pending_review
- [ ] Rejected → เห็น reason + resubmit ได้
- [ ] Revenue ตรงกับ BE
