# BE-008 — Wallet & Coins API

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 2 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §6,7.2,7.3,8, FR-13,14,15,16, NFR-8 |
| ขึ้นกับ | DB-001, BE-001 |
| บล็อก | BE-009 |

## Endpoints

```
GET  /api/v1/wallet                        → { balance }   (Next.js Route Handler)
GET  /api/v1/wallet/transactions?cursor=   → ประวัติ paginated
GET  /api/v1/coin-packages                 → รายการ active
POST /api/v1/wallet/topup { packageId }
     → 201 { topupId, amount, balance } (MOCK — เติมทันที)
```

## ความถูกต้องของเหรียญ (NFR-8)

- [ ] ทุกการเปลี่ยนยอดผ่าน **ledger** (wallet_transactions) เท่านั้น
- [ ] ตัดเหรียญ (ตอนใช้จ่าย): atomic Mongo
      `updateOne({_id, balance:{$gte:amt}}, {$inc:{balance:-amt}})` แล้วเช็ก `modifiedCount`
- [ ] `balance_after` บันทึกทุกแถว

## Flow เติมเหรียญ (MOCK)

1. POST /wallet/topup → เพิ่ม coins+bonus เข้า wallet **ทันที** (atomic `$inc`) — ไม่มี gateway/webhook, ไม่ต้องมี pending state (ถือว่า paid ทันที)
2. บันทึก wallet_transactions (topup + bonus) พร้อม `balance_after`

## Definition of Done

- [ ] เติมสำเร็จ → coins+bonus เข้าทันที
- [ ] `balance = SUM(transactions)` เช็กตอน demo
