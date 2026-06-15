# INFRA-002 — Payment Gateway Selection & Setup

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | PM + DevOps |
| อ้างอิง | DevSpec §2, PRD Q-1 |
| บล็อก | BE-003 (Orders & Payment) |

## งานที่ต้องทำ

- [ ] **เคาะเจ้า payment gateway** — Omise หรือ 2C2P (PRD Q-1 ต้องตัดสินใจก่อน)
- [ ] ขอ API key สำหรับ test/sandbox environment
- [ ] ทดสอบ test card และ QR PromptPay ใน sandbox
- [ ] ลงทะเบียน webhook URL (staging) กับ payment gateway
- [ ] ยืนยัน fee rate จริงจากเจ้า gateway (เพื่อตั้งค่า `GATEWAY_FEE_RATE`)
- [ ] วาง webhook secret สำหรับตรวจลายเซ็น

## ตัวเลือกที่พิจารณา

| Gateway | บัตรเครดิต | QR PromptPay | หมายเหตุ |
|---------|-----------|-------------|---------|
| **Omise** | ✅ | ✅ | เป็น Thai-first, เอกสารดี |
| **2C2P** | ✅ | ✅ | ใหญ่กว่า, รองรับ enterprise |

## Definition of Done

- [ ] ได้ test keys และ webhook secret แล้ว
- [ ] สามารถ simulate การจ่ายเงินผ่าน sandbox ได้สำเร็จ (บัตร + QR)
- [ ] Webhook signature verification ทำงานถูกต้อง
