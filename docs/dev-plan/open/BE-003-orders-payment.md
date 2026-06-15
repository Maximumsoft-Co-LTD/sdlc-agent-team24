# BE-003 — Orders & Payment API

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 1 (จ่ายตรง), 2 (จ่ายเหรียญ) |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §6,7.1,7.2,9, FR-5,6,8,15,17 |
| ขึ้นกับ | DB-001, BE-001, INFRA-002 · (Sprint 2) BE-008 |

## Endpoints

```
POST /api/v1/orders   { bookId, type, paymentMethod:"coin"|"card"|"promptpay" }
GET  /api/v1/orders/:id
POST /api/v1/payments/webhook
```

## Sprint 1 — จ่ายตรง

- [ ] สร้าง order + order_items → เรียก gateway API
- [ ] Webhook: atomic — order→paid + entitlement + revenue_split
- [ ] Idempotency ด้วย `payment_ref`
- [ ] Revenue split: `gateway_fee = round(gross × rate)` · `publisher_share = net − platform_cut`
- [ ] ตรวจ `platform_cut + publisher_share == net` ก่อน insert (NFR-5)

## Sprint 2 — จ่ายด้วยเหรียญ

- [ ] `SELECT FOR UPDATE` wallet → ตัดเหรียญ (WHERE balance>=amount)
- [ ] Atomic: wallet_transaction type='spend' + order→paid + entitlement + revenue_split (gateway_fee=0)
- [ ] Idempotency กัน spend ซ้ำ
- [ ] ยอดไม่พอ → 402 INSUFFICIENT_COINS

## Definition of Done

- [ ] ซื้อ/เช่า card/QR → ได้สิทธิ์ + revenue_split
- [ ] จ่ายเหรียญ → ตัดยอด + ได้สิทธิ์ (gateway_fee=0)
- [ ] Webhook ซ้ำไม่สร้างซ้ำ
- [ ] Unit test coverage ≥ 80% (payment + revenue module)
