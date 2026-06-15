# FE-007 — Cart & Checkout Pages

| Field | Value |
|-------|-------|
| สถานะ | done |
| Sprint | 2 |
| ผู้รับผิดชอบ | Frontend Dev |
| อ้างอิง | FR-19 |
| ขึ้นกับ | BE-009, FE-001, FE-006 |

## งานที่ต้องทำ

- [x] Cart badge บน navbar (จำนวน item)
- [x] ปุ่ม "เพิ่มในตะกร้า" ใน book detail (ซื้อขาดเท่านั้น)
- [x] `/cart` — รายการ + ราคา + ยอดรวม + ลบ + ยืนยันชำระ
- [x] เลือกชำระ: เหรียญ (ถ้าพอ) / mock pay (จำลอง)
- [x] ยืนยันชำระ (จำลอง) → สำเร็จทันที (ไม่มี gateway / ไม่มี polling) → clear cart + "ซื้อสำเร็จ X เล่ม" + link library
- [x] ล้มเหลว → ตะกร้าไม่ล้าง + error

## Definition of Done

- [x] Checkout หลายเล่ม → ได้สิทธิ์ครบ
- [x] เพิ่มเช่า → error CART_BUY_ONLY
