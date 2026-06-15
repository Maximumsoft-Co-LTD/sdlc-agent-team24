# INFRA-002 — Payment Gateway Selection & Setup

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | PM + DevOps |
| อ้างอิง | DevSpec Full §2, PRD Q-1 |
| บล็อก | BE-003, BE-008 |

## งานที่ต้องทำ

- [ ] **เคาะ gateway** — Omise หรือ 2C2P (PRD Q-1 ต้องตัดสินใจก่อน)
- [ ] ขอ sandbox API keys (card + QR PromptPay)
- [ ] ลงทะเบียน webhook URL (staging)
- [ ] ยืนยัน fee rate จริง → ตั้ง `GATEWAY_FEE_RATE`
- [ ] ทดสอบ test card + QR ใน sandbox

| Gateway | Card | QR PromptPay |
|---------|------|-------------|
| Omise | ✅ | ✅ |
| 2C2P | ✅ | ✅ |

## Definition of Done

- [ ] ได้ sandbox keys + webhook secret
- [ ] Simulate จ่ายสำเร็จ + ล้มเหลว ผ่าน sandbox
- [ ] Webhook signature verification ทำงานได้
