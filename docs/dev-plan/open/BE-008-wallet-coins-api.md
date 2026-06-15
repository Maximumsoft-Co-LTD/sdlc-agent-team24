# BE-008 — Wallet & Coins API

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 2 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §6,7.2,7.3,8, FR-13,14,15,16, NFR-8 |
| ขึ้นกับ | DB-001, BE-001, INFRA-002 |
| บล็อก | BE-009 |

## Endpoints

```
GET  /api/v1/wallet                        → { balance }
GET  /api/v1/wallet/transactions?cursor=   → ประวัติ paginated
GET  /api/v1/coin-packages                 → รายการ active
POST /api/v1/wallet/topup { packageId, paymentMethod }
     → 201 { topupId, amount, payment }
```

## ความถูกต้องของเหรียญ (NFR-8)

- [ ] ทุกการเปลี่ยนยอดผ่าน **ledger** (wallet_transactions) เท่านั้น
- [ ] ตัดเหรียญ: `UPDATE wallets SET balance=balance-:amt WHERE id=:id AND balance>=:amt`
- [ ] Idempotency key ต่อ topup/order กัน double-charge
- [ ] `balance_after` บันทึกทุกแถว
- [ ] Daily reconcile job (RECONCILE_CRON): `balance == SUM(amount)`

## Flow เติมเหรียญ

1. POST /wallet/topup → topup `pending` + gateway payment
2. webhook → atomic: topup→`paid` + wallet_transactions (topup+bonus) + อัปเดต balance
3. ล้มเหลว → ยอดไม่เปลี่ยน

## Definition of Done

- [ ] เติมสำเร็จ → coins+bonus เข้า ≤10 วิ
- [ ] กดเติมรัว → ไม่เติมซ้ำ
- [ ] `balance = SUM(transactions.amount)` หลังทุก operation
- [ ] Unit test coverage ≥ 80%
