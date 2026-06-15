# OPS-001 — Load Testing & Monitoring

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | DevOps + Backend Dev |
| อ้างอิง | DevSpec Full §11,15, NFR-1,2,7 |
| ขึ้นกับ | INFRA-001, BE-001~012 |

## Load Testing (ก่อนเปิดตัว)

- [ ] จำลอง 500 concurrent users (เป้าเปิดตัว)
- [ ] จำลอง 1,000 concurrent users (เผื่อขยาย)
- [ ] เครื่องมือ: k6 หรือ Locust

| Endpoint | SLA p95 |
|---------|---------|
| GET /books | ≤ 2.5s |
| GET /books/:id | ≤ 2.5s |
| GET content-url | ≤ 1s |
| เปิด EPUB ครั้งแรก | ≤ 4s |
| Error rate | < 0.5% |

## Monitoring (NFR-7)

- [ ] Centralized logging (structured JSON)
- [ ] APM: latency/error rate/throughput per endpoint
- [ ] Alert: p95 latency เกิน threshold + error rate > 0.5%
- [ ] Dashboard: concurrent users, DB connections, Redis memory
- [ ] Dashboard queries: read replica + cache (backoffice)
- [ ] Daily reconciliation job: orders(paid) vs entitlements + wallet balance

## Definition of Done

- [ ] Load test ผ่าน 500 concurrent users
- [ ] Monitoring dashboard พร้อม
- [ ] Alert ทำงาน
