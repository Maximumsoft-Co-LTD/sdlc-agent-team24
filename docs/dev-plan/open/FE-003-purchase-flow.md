# FE-003 — Purchase & Payment Flow

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 1 |
| ผู้รับผิดชอบ | Frontend Dev |
| อ้างอิง | FR-5,6,8 |
| ขึ้นกับ | BE-003, FE-001, FE-002 |

## งานที่ต้องทำ

- [ ] Purchase modal: เลือก ซื้อ/เช่า + mock pay UI (ชำระแบบจำลอง)
- [ ] Mock pay UI: แสดงรูป PromptPay QR จำลอง (fake) + ปุ่ม "ยืนยันชำระ (จำลอง)"
- [ ] กดยืนยัน → เรียก `POST /orders` → คืนสถานะ paid ทันที (ไม่มี gateway / ไม่มี polling)
- [ ] paid → redirect library หรือหน้าอ่าน
- [ ] Error states: DUPLICATE_ENTITLEMENT, RENT_NOT_AVAILABLE

## Definition of Done

- [ ] ซื้อ/เช่าผ่าน mock pay → ได้ entitlement ทันที
- [ ] Error states (DUPLICATE_ENTITLEMENT, RENT_NOT_AVAILABLE) แสดงถูกต้อง
