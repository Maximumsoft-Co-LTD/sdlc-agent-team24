# BE-009 — Cart API (ตะกร้า)

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 2 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §6, §7.4, FR-19 |
| ขึ้นกับ | DB-001, BE-001, BE-003, BE-008 |

## Endpoints

```
GET    /api/v1/cart
       → { items:[{ book:{id,title,coverUrl,priceBuy}, unitPrice }], total, count }

POST   /api/v1/cart/items   { bookId }
       → 201 { item }
       → 400 CART_BUY_ONLY    (เพิ่มเช่าลงตะกร้าไม่ได้)
       → 409 DUPLICATE_CART_ITEM

DELETE /api/v1/cart/items/:bookId
       → 204

POST   /api/v1/cart/checkout
       { paymentMethod:"coin"|"card"|"promptpay" }
       → 201 { orderId, amount, payment? }
       → 402 INSUFFICIENT_COINS
       → 400 CART_EMPTY
```

## กฎตะกร้า (PRD A-9)

- เฉพาะ **type='buy'** เท่านั้น — เช่าทำทีละเล่มผ่าน `POST /orders`
- กันรายการซ้ำด้วย UNIQUE(cart_id, book_id)
- 1 user = 1 cart (UNIQUE user_id)

## Flow Cart Checkout (§7.4)

1. `POST /cart/checkout` → ตรวจ cart ไม่ว่าง
2. สร้าง order เดียว + **order_items** ทุกเล่ม
3. ชำระ (coin/card/QR) ครั้งเดียว
4. จ่ายสำเร็จ → ออกสิทธิ์ทุกเล่ม + revenue_split ต่อ order_item → **ล้างตะกร้า**
5. จ่ายล้มเหลว → ตะกร้าไม่ล้าง

## งานที่ต้องทำ

- [ ] CRUD cart items พร้อม guard (ซื้อขาดเท่านั้น)
- [ ] Checkout: atomic transaction (order + items + entitlements + revenue_splits + ล้างตะกร้า)
- [ ] Coin checkout: ล็อก wallet → ตัดเหรียญ → order paid → ออกสิทธิ์ทุกเล่ม
- [ ] Card/QR checkout: สร้าง single payment สำหรับ total amount → webhook → ออกสิทธิ์ทุกเล่ม
- [ ] ถ้าเล่มใดใน cart มี entitlement active อยู่แล้ว → 409 DUPLICATE_ENTITLEMENT

## Definition of Done

- [ ] เพิ่ม/ลบ/ดูตะกร้าทำงานถูกต้อง
- [ ] เพิ่มรายการเช่า → 400 CART_BUY_ONLY
- [ ] Checkout รวมหลายเล่ม → ออกสิทธิ์ครบทุกเล่ม
- [ ] จ่ายล้มเหลว → ตะกร้าไม่ล้าง ไม่มีสิทธิ์
