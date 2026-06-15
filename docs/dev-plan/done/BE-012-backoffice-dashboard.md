# BE-012 — Back Office Dashboard & Analytics API

| Field | Value |
|-------|-------|
| สถานะ | done |
| Sprint | 3 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | BackOffice Spec §5, §6, §9, FR-17, FR-18, FR-20 |
| ขึ้นกับ | DB-001, BE-001, BE-003, BE-010, BE-011 |

## Endpoints

### Admin Dashboard & Management   (Next.js Route Handlers)
```
GET /api/v1/admin/dashboard?from=&to=
    → { gmv, platformCut, publisherShare, buyCount, rentCount,
        booksByStatus:{published,pendingReview,draft,suspended},
        revenueByMonth:[{month, gmv, platformCut, publisherShare}],
        recentOrders:[...], recentAuditLogs:[...] }         (FR-17, FR-20)

GET /api/v1/admin/revenue?from=&to=&publisher=
    → { summary:{gmv,gatewayFee,net,platformCut,publisherShare},
        byPublisher:[{publisher, gross, share}],
        items:[{order_item, book, publisher, gross, split}] }
    → ?export=csv  → Content-Type: text/csv               (FR-17)

GET /api/v1/admin/publishers
    → { items:[{id, name, revenue_share, bookCount, totalEarnings}] }
PATCH /api/v1/admin/publishers/:id
    → { revenue_share }  (ปรับอัตราส่วนแบ่ง)

GET /api/v1/admin/audit-logs?cursor=&action=&target_type=
    → { items:[{actor, action, target, note, createdAt}], nextCursor }
```

### Publisher Dashboard
```
GET /api/v1/publisher/dashboard?from=&to=
    → { myGmv, myPublisherShare, bookCount, soldCount, rentCount,
        revenueByMonth:[...], topBooks:[{book, sales, share}] }  (FR-18)

GET /api/v1/publisher/revenue?from=&to=
    → รายละเอียดส่วนแบ่ง เฉพาะ publisher_id ของตน
    → ?export=csv  → text/csv                              (FR-18)
```

## งานที่ต้องทำ

### Performance (§6 — คิวรีหนัก)
- [x] ทุก aggregation query ใช้ MongoDB aggregation pipeline ตรง ๆ
- [x] index `orders(paid_at)` + `revenue_splits(publisher_id, created_at)`

### Security (§9 — IDOR Prevention)
- [x] ทุก `/publisher/*` query: ผูก `publisher_id` จาก **JWT token** เสมอ — ห้ามรับ publisher_id จาก client
- [x] `/admin/*` เฉพาะ `role=admin` (403 ถ้าไม่ใช่)
- [x] Export CSV: บันทึก audit_log ว่าใคร export เมื่อไร

### Audit Logs (§4)
- [x] เพิ่ม action types: `'submit','approve','publish','reject','suspend','price_change','payout'`
- [x] `GET /admin/audit-logs` — paginated, filter by action/target_type

### Publisher Management
- [x] List publishers พร้อม bookCount + totalEarnings
- [x] PATCH revenue_share → บันทึก audit_log (price_change)

### Revenue Export
- [x] CSV format: date, book, publisher, gross, gateway_fee, net, platform_cut, publisher_share
- [x] จำกัดสิทธิ์: admin export ได้ทุกราย, publisher export เฉพาะของตน

## Definition of Done
- [x] Dashboard ตัวเลขตรงกับ SUM(revenue_splits) จริง (กระทบยอดได้)
- [x] Publisher เรียก dashboard ของรายอื่นไม่ได้ (403)
- [x] Export CSV ถูกต้อง + มี audit log
- [x] Dashboard แสดงผลถูกต้อง
