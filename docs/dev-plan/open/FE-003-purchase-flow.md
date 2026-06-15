# FE-003 — Purchase & Payment Flow

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 1 |
| ผู้รับผิดชอบ | Frontend Dev |
| อ้างอิง | FR-5,6,8 |
| ขึ้นกับ | BE-003, FE-001, FE-002, INFRA-002 |

## งานที่ต้องทำ

- [ ] Purchase modal: เลือก ซื้อ/เช่า + วิธีชำระ (บัตร/QR)
- [ ] บัตร: ใช้ gateway hosted fields (ห้ามรับ card number เอง)
- [ ] QR: แสดง QR จาก qrPayload
- [ ] Poll `GET /orders/:id` ทุก 2s จนสถานะ paid/failed (timeout 5 นาที)
- [ ] paid → redirect library หรือหน้าอ่าน
- [ ] Error states: จ่ายล้มเหลว, DUPLICATE_ENTITLEMENT, RENT_NOT_AVAILABLE

## Definition of Done

- [ ] ซื้อ/เช่าด้วย sandbox card/QR → ได้ entitlement
- [ ] ไม่มี card number ผ่าน frontend โดยตรง
