# FE-005 — EPUB Reader (Frontend)

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | Frontend Dev |
| อ้างอิง | DevSpec §6, §7.2, §7.3, FR-9, FR-12 |
| ขึ้นกับ | BE-005, FE-001 |

## งานที่ต้องทำ

### `/read/:bookId` — หน้าอ่านหนังสือ
- [ ] ติดตั้งและ integrate `epub.js` (Client Component)
- [ ] เรียก `GET /books/:id/content-url` เพื่อรับ presigned URL
- [ ] โหลด EPUB จาก presigned URL ผ่าน epub.js
- [ ] เปิดเล่มแรก ≤ 4 วินาที (NFR-1)

### Reading Progress (FR-9)
- [ ] โหลด progress เดิมจาก `GET /me/progress/:bookId` → เปิดที่ CFI นั้น
- [ ] `PUT /me/progress/:bookId` ทุกครั้งที่เปลี่ยนหน้า (debounce 1s) หรือตอนปิด

### UX Controls
- [ ] หน้าถัดไป / ย้อนกลับ
- [ ] สารบัญ (Table of Contents จาก epub.js)
- [ ] ปรับขนาดตัวอักษร
- [ ] แสดง % ที่อ่านแล้ว

### Error States
- [ ] 403 NO_ENTITLEMENT → popup "เช่าหมดอายุ — เช่าอีกครั้ง / ซื้อขาด" (FR-7, §7.3)
- [ ] Presigned URL หมดอายุระหว่างอ่าน → ขอ URL ใหม่อัตโนมัติ

### Security
- [ ] ไม่มีปุ่มดาวน์โหลดไฟล์ EPUB (FR-12)
- [ ] ฟอนต์ไทยและการจัดหน้าถูกต้อง ≥ 360px (NFR-6)

## Definition of Done

- [ ] เปิดอ่านได้สำหรับ user ที่มีสิทธิ์
- [ ] ปิดแล้วเปิดใหม่ → กลับมาหน้าเดิม
- [ ] เช่าหมดอายุ → popup ถูกต้อง (ไม่แสดง content)
- [ ] ทดสอบบน 360px viewport
