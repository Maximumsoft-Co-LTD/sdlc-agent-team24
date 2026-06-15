# BE-003 — Orders & Payment API

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 1 (จ่ายตรง mock), 2 (จ่ายเหรียญ) |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §6,7.1,7.2,9, FR-5,6,8,15,17 |
| ขึ้นกับ | DB-001, BE-001 · (Sprint 2) BE-008 |

## Endpoints

```
POST /api/v1/orders   { bookId, type, paymentMethod:"coin"|"mock" }   (Next.js Route Handler)
GET  /api/v1/orders/:id
```

## Sprint 1 — จ่ายตรง (MOCK payment)

- [ ] `POST /api/v1/orders` ทำ mock payment ใน handler เดียว: สร้าง order → set `paid` ทันที + สร้าง entitlement + revenue_split (ไม่มี gateway, ไม่มี webhook)
- [ ] Mock pay อยู่หลัง adapter (เช่น `PaymentAdapter`) เพื่อให้ swap เป็น gateway จริงได้ภายหลัง
- [ ] Revenue split: `gateway_fee = round(gross × rate)` (mock = 0 หรือค่าคงที่) · `publisher_share = net − platform_cut`
- [ ] ตรวจ `platform_cut + publisher_share == net` ก่อน insert (NFR-5)

## Sprint 2 — จ่ายด้วยเหรียญ

- [ ] ตัดเหรียญแบบ atomic ด้วย Mongo:
      `updateOne({_id, balance:{$gte:amt}}, {$inc:{balance:-amt}})` แล้วเช็ก `modifiedCount === 1`
- [ ] Atomic: wallet_transaction type='spend' + order→paid + entitlement + revenue_split (gateway_fee=0)
- [ ] กัน spend ซ้ำ (เช็ก order ที่ paid แล้ว)
- [ ] ยอดไม่พอ (`modifiedCount === 0`) → 402 INSUFFICIENT_COINS

## Definition of Done

- [ ] ซื้อ/เช่า (mock) → ได้สิทธิ์ + revenue_split
- [ ] จ่ายเหรียญ → ตัดยอด + ได้สิทธิ์ (gateway_fee=0)
- [ ] smoke test ผ่าน
