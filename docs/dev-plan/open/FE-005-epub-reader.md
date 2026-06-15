# FE-005 — EPUB Reader

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 1 |
| ผู้รับผิดชอบ | Frontend Dev |
| อ้างอิง | FR-9,12 |
| ขึ้นกับ | BE-005, FE-001 |

## งานที่ต้องทำ

- [ ] `/read/:bookId` — Client Component + epub.js
- [ ] เรียก content-url → โหลด EPUB จาก MinIO presigned URL
- [ ] เปิดเล่มแรก ≤ 4s (NFR-1)
- [ ] โหลด/บันทึก progress (CFI) — debounce 1s
- [ ] หน้าถัดไป/ย้อนกลับ, สารบัญ, ปรับขนาดตัวอักษร, % ที่อ่าน
- [ ] 403 NO_ENTITLEMENT → popup "เช่าหมดอายุ — เช่าอีกครั้ง / ซื้อขาด"
- [ ] MinIO presigned URL หมดอายุระหว่างอ่าน → ขอใหม่อัตโนมัติ
- [ ] ไม่มีปุ่มดาวน์โหลด EPUB (FR-12)
- [ ] ฟอนต์ไทย + ≥360px (NFR-6)

## Definition of Done

- [ ] เปิดอ่านได้, ปิดแล้วกลับมาหน้าเดิม
- [ ] หมดอายุ → popup ถูกต้อง
