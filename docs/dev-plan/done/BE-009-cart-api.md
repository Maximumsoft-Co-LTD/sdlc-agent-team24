# BE-009 — Cart API

| Field | Value |
|-------|-------|
| สถานะ | done |
| Sprint | 2 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §6,7.4, FR-19 |
| ขึ้นกับ | DB-001, BE-001, BE-003, BE-008 |

## Endpoints

```
GET    /api/v1/cart                     → { items, total, count }   (Next.js Route Handler)
POST   /api/v1/cart/items { bookId }    → 201 / 400 CART_BUY_ONLY / 409 DUPLICATE
DELETE /api/v1/cart/items/:bookId       → 204
POST   /api/v1/cart/checkout { paymentMethod:"coin"|"mock" }
       → 201 { orderId, amount }
       → 402 INSUFFICIENT_COINS / 400 CART_EMPTY
```

## กฎตะกร้า

- เฉพาะ type='buy' — เช่าทำผ่าน POST /orders ทีละเล่ม (PRD A-9)
- 1 user = 1 cart (UNIQUE)

## Flow Checkout (§7.4)

1. ตรวจ cart ไม่ว่าง
2. สร้าง order + order_items ทุกเล่ม
3. ชำระครั้งเดียว: coin (atomic `$inc` ตัดยอด เช็ก `modifiedCount`) หรือ mock (paid ทันที)
4. paid → ออกสิทธิ์ทุกเล่ม + revenue_split ต่อ item → ล้างตะกร้า
5. ล้มเหลว → ตะกร้าไม่ล้าง

## Definition of Done

- [x] เพิ่มเช่า → 400 CART_BUY_ONLY
- [x] Checkout → ได้สิทธิ์ครบทุกเล่ม
- [x] ล้มเหลว → ตะกร้าไม่ล้าง
