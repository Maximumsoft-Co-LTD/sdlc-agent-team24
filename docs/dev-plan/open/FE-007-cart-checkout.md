# FE-007 — Cart & Checkout Pages

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 2 |
| ผู้รับผิดชอบ | Frontend Dev |
| อ้างอิง | FR-19 |
| ขึ้นกับ | BE-009, FE-001, FE-006 |

## งานที่ต้องทำ

- [ ] Cart badge บน navbar (จำนวน item)
- [ ] ปุ่ม "เพิ่มในตะกร้า" ใน book detail (ซื้อขาดเท่านั้น)
- [ ] `/cart` — รายการ + ราคา + ยอดรวม + ลบ + ยืนยันชำระ
- [ ] เลือกชำระ: เหรียญ (ถ้าพอ) / mock pay (จำลอง)
- [ ] ยืนยันชำระ (จำลอง) → สำเร็จทันที (ไม่มี gateway / ไม่มี polling) → clear cart + "ซื้อสำเร็จ X เล่ม" + link library
- [ ] ล้มเหลว → ตะกร้าไม่ล้าง + error

## Definition of Done

- [ ] Checkout หลายเล่ม → ได้สิทธิ์ครบ
- [ ] เพิ่มเช่า → error CART_BUY_ONLY
