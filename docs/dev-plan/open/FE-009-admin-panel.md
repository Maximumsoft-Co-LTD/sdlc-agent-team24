# FE-009 — Admin Panel (Frontend)

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 3 |
| ผู้รับผิดชอบ | Frontend Dev |
| อ้างอิง | DevSpec Full §6, §7.8, FR-20 |
| ขึ้นกับ | BE-011, FE-001 |

## งานที่ต้องทำ

### `/admin/books` — คิวรออนุมัติ
- [ ] ตาราง: title, author, publisher, submittedAt, isExclusive flag
- [ ] Filter: status (pending_review / published / rejected / suspended)
- [ ] เรียงตาม submittedAt (เก่าสุดก่อน — FIFO)
- [ ] คลิกแต่ละแถว → `/admin/books/:id` รายละเอียด

### `/admin/books/:id` — รายละเอียด + Action
- [ ] แสดง metadata ครบ: ชื่อ, ผู้แต่ง, สำนักพิมพ์, ราคา, โหมดขาย, isExclusive
- [ ] Preview ปกหนังสือ
- [ ] link ดาวน์โหลด/preview EPUB (presigned URL ชั่วคราว)
- [ ] ปุ่ม **"เผยแพร่"** (publish) — ยืนยันก่อนกด
- [ ] ปุ่ม **"ตีกลับ"** (reject) — กรอก reason ก่อนส่ง
- [ ] ปุ่ม **"ระงับ"** (suspend) — สำหรับเล่มที่ published แล้วมีปัญหา + ยืนยัน

### UX
- [ ] ทุก action มี confirmation dialog ก่อน
- [ ] หลัง action → แสดง success + อัปเดตสถานะในตาราง
- [ ] Guard: redirect ถ้า role ≠ admin

## Definition of Done

- [ ] Admin เห็น queue pending_review
- [ ] Publish → book โผล่หน้าร้านผู้ใช้
- [ ] Reject พร้อม reason → publisher เห็น
- [ ] Suspend → book หายจากร้าน
- [ ] `tsc --noEmit` และ `lint` ผ่าน
