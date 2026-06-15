# INFRA-002 — Mock Payment Adapter

| Field | Value |
|-------|-------|
| สถานะ | done (mock inline ใน BE-003 + BE-008) |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §2 |
| บล็อก | BE-003, BE-008 |

## งานที่ต้องทำ

- [ ] สร้าง mock payment module ที่มี interface เดียว: `pay()` / `topup()`
- [ ] mock สำเร็จทันที (synchronous) และคืน `payment_ref` ปลอม
- [ ] ให้ BE-003 และ BE-008 เรียกใช้ adapter นี้แทน gateway จริง
- [ ] ออกแบบเป็น adapter เพื่อให้ gateway จริง (Omise/Stripe/2C2P) มาแทนภายหลังได้โดยไม่ต้องแก้ฝั่งผู้เรียก
- [ ] (ทางเลือก) render จำลอง PromptPay QR สำหรับ UI

## Definition of Done

- [ ] `pay()` / `topup()` ของ mock คืนผลสำเร็จแบบ synchronous พร้อม `payment_ref` ปลอม
- [ ] เอกสาร interface ของ adapter ชัดเจน (พร้อมแทนด้วย gateway จริงภายหลัง)
