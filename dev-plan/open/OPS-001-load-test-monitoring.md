# OPS-001 — Load Testing & Monitoring

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | DevOps + Backend Dev |
| อ้างอิง | DevSpec §11, §16, NFR-1, NFR-2, NFR-7 |
| ขึ้นกับ | INFRA-001, BE-001~007 |

## Load Testing (§16.2, PRD §12)

- [ ] จำลอง **500 concurrent users** (เป้าเปิดตัว)
- [ ] จำลอง **1,000 concurrent users** (เผื่อขยาย)
- [ ] ต้องผ่านเกณฑ์:

| Endpoint | SLA (p95) |
|---------|----------|
| GET /books (listing) | ≤ 2.5s |
| GET /books/:id | ≤ 2.5s |
| GET /books/:id/content-url | ≤ 1s |
| เปิดเล่ม EPUB ครั้งแรก | ≤ 4s |
| Error rate | < 0.5% |
| Uptime | ≥ 99% |

- [ ] เครื่องมือ: k6 หรือ Locust
- [ ] ทดสอบ scenario: อ่าน 95% / เขียน (ซื้อ) 5%
- [ ] CDN deliver ไฟล์หนังสือโดยไม่ผ่าน API

## Monitoring Setup (NFR-7)

- [ ] Centralized logging (structured JSON logs)
- [ ] APM: latency, error rate, throughput per endpoint
- [ ] Alert: p95 latency เกิน threshold
- [ ] Dashboard: concurrent users, DB connections, Redis memory
- [ ] Daily reconciliation job: orders(paid) vs entitlements

## Definition of Done

- [ ] Load test ผ่าน 500 concurrent users ก่อนเปิดตัว
- [ ] Monitoring dashboard พร้อมใช้
- [ ] Alert ส่ง notification เมื่อ error rate > 0.5%
