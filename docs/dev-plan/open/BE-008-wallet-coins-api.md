# BE-008 — Wallet & Coins API

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 2 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §6, §7.2, §7.3, §8, FR-13, FR-14, FR-15, FR-16, NFR-8 |
| ขึ้นกับ | DB-001, BE-001, INFRA-002 |
| บล็อก | BE-009 (Cart ต้องการ coin payment) |

## Endpoints

```
GET  /api/v1/wallet                      → { balance }                          (FR-13)
GET  /api/v1/wallet/transactions?cursor= → ประวัติเดินสะพัด paginated            (FR-16)
GET  /api/v1/coin-packages               → รายการแพ็กเกจ active
POST /api/v1/wallet/topup
     { packageId, paymentMethod:"card"|"promptpay" }
     → 201 { topupId, amount, payment:{ clientSecret|qrPayload } }              (FR-14)
```

## Flow เติมเหรียญ (FR-14, §7.3)

1. `POST /wallet/topup` → สร้าง topup `pending` + เรียก gateway
2. ผู้ใช้จ่าย → webhook → **atomic**: topup→`paid` → เพิ่ม `wallet_transactions` (type='topup' + 'bonus' ถ้ามี) → อัปเดต `wallets.balance`
3. จ่ายไม่สำเร็จ → topup→`failed` ยอดไม่เปลี่ยน

## ความถูกต้องของเหรียญ (NFR-8)

- [ ] ทุกการเปลี่ยนยอดผ่าน **ledger** เท่านั้น (ห้าม UPDATE balance ตรงๆ)
- [ ] ตัดเหรียญ: `UPDATE wallets SET balance=balance-:amt WHERE id=:id AND balance>=:amt` → ตรวจ affected rows (กันติดลบ)
- [ ] **Idempotency key** ต่อ topup/order: กันตัดซ้ำ/เติมซ้ำ
- [ ] `balance_after` บันทึกในทุกแถว wallet_transactions
- [ ] งานเทียบยอดรายวัน (RECONCILE_CRON): `balance == SUM(amount)` ทุกบัญชี

## Coin Packages เริ่มต้น (Seed)

| เหรียญ | Bonus | ราคา (บาท) |
|--------|-------|-----------|
| 50 | 0 | 50 |
| 100 | 0 | 100 |
| 300 | +15 | 300 |
| 500 | +40 | 500 |
| 1,000 | +120 | 1,000 |

## Definition of Done

- [ ] เติมเหรียญ coins+bonus เข้าบัญชีภายใน ≤10 วินาที (FR-14)
- [ ] จ่ายล้มเหลว → ยอดไม่เปลี่ยน
- [ ] กดเติมรัว → ไม่เติมซ้ำ (idempotency)
- [ ] `balance = SUM(transactions.amount)` ทุกบัญชีหลังทุก operation
- [ ] ประวัติแสดงถูก (type, amount, balance_after)
- [ ] Unit test coverage ≥ 80% (wallet module)
