# BE-003 — Orders & Payment API

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | Backend Dev |
| Sprint | 1 (จ่ายตรง), 2 (จ่ายด้วยเหรียญ) |
| อ้างอิง | DevSpec Full §6, §7.1, §7.2, §9, FR-5, FR-6, FR-8, FR-15, FR-17 |
| ขึ้นกับ | DB-001, BE-001, INFRA-002 · (Sprint 2) BE-008 |

## Endpoints

```
POST /api/v1/orders
     { bookId, type:"buy"|"rent", paymentMethod:"coin"|"card"|"promptpay" }
     → 201 { orderId, amount, payment? }
     → 400 RENT_NOT_AVAILABLE
     → 402 INSUFFICIENT_COINS     (Sprint 2)
     → 409 DUPLICATE_ENTITLEMENT

GET  /api/v1/orders/:id           → สถานะคำสั่งซื้อ

POST /api/v1/payments/webhook     → (gateway) ยืนยันจ่าย → atomic: paid + entitlement + revenue_split
```

## Sprint 1 — จ่ายตรง (บัตร / QR) (FR-5, FR-6, FR-8, FR-17)

- [ ] สร้าง order + **order_items** (1 รายการ)
- [ ] เรียก payment gateway API → คืน clientSecret (บัตร) หรือ qrPayload (QR)
- [ ] Webhook: ตรวจลายเซ็น → **atomic transaction**: order→`paid` + entitlement + revenue_split
- [ ] Idempotency ด้วย `payment_ref` (กัน webhook ซ้ำ)
- [ ] จ่ายไม่สำเร็จ → `failed` ไม่ออก entitlement

### Revenue Split (FR-17) — คิดต่อ order_item
```
gateway_fee     = round(gross × GATEWAY_FEE_RATE)   # จ่ายตรง
net             = gross - gateway_fee
platform_cut    = round(net × (1 - publisher.revenue_share))
publisher_share = net - platform_cut
```
- [ ] ตรวจ `platform_cut + publisher_share == net` ก่อน insert

## Sprint 2 — จ่ายด้วยเหรียญ (FR-15, NFR-8)

- [ ] ตรวจยอด wallet ≥ amount (SELECT FOR UPDATE)
- [ ] Atomic transaction: ล็อกแถว wallet → ตัดเหรียญ (`wallet_transactions` type='spend') → order→`paid` → entitlement → revenue_split (gateway_fee=0, PRD A-8)
- [ ] Idempotency: กัน spend ซ้ำต่อ order
- [ ] ยอดไม่พอ → 402 INSUFFICIENT_COINS

## Definition of Done

- [ ] ซื้อ/เช่าด้วยบัตร/QR → ได้สิทธิ์ + revenue_split
- [ ] จ่ายด้วยเหรียญ → ตัดยอด + ได้สิทธิ์ (gateway_fee=0)
- [ ] Webhook ซ้ำไม่สร้างซ้ำ
- [ ] กดซื้อรัวด้วยเหรียญไม่ติดลบ
- [ ] Unit test coverage ≥ 80% (payment + revenue module)
