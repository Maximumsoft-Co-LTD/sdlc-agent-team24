# FE-003 — Purchase & Payment Flow (Frontend)

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | Frontend Dev |
| อ้างอิง | DevSpec §6, §7.1, FR-5, FR-6, FR-8 |
| ขึ้นกับ | BE-003, FE-001, FE-002, INFRA-002 |

## งานที่ต้องทำ

### Purchase Modal / Page
- [ ] เลือก "ซื้อ" หรือ "เช่า 7 วัน" + แสดงราคา
- [ ] เลือกวิธีชำระ: บัตรเครดิต / QR PromptPay
- [ ] ยืนยันก่อนจ่าย (summary หน้าสุดท้าย)

### Payment UI
- [ ] **บัตรเครดิต** — ใช้ payment gateway's hosted fields / JS SDK (ไม่รับ card number เอง)
- [ ] **QR PromptPay** — แสดง QR code จาก `qrPayload` ที่ได้จาก API

### Order Status Polling
- [ ] หลัง submit → poll `GET /orders/:id` ทุก 2 วินาที จนสถานะเป็น `paid` หรือ `failed`
- [ ] timeout 5 นาที → แสดงข้อความให้ตรวจสอบในภายหลัง
- [ ] จ่ายสำเร็จ → redirect ไปหน้าอ่าน หรือ library

### Error States
- [ ] จ่ายไม่สำเร็จ → แสดงข้อความชัดเจน + ปุ่มลองใหม่
- [ ] `DUPLICATE_ENTITLEMENT` → "คุณมีเล่มนี้แล้ว"
- [ ] `RENT_NOT_AVAILABLE` → ซ่อนตัวเลือกเช่า

## Definition of Done

- [ ] ซื้อด้วยบัตร sandbox → ได้ entitlement → โผล่ใน library
- [ ] ซื้อด้วย QR sandbox → ได้ entitlement → โผล่ใน library
- [ ] Error state แสดงถูกต้องทุกกรณี
- [ ] ไม่มี card number ผ่าน frontend โดยตรง
