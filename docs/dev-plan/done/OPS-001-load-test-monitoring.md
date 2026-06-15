# OPS-001 — Load Testing & Monitoring

| Field | Value |
|-------|-------|
| สถานะ | done (ตัดออก demo — production เท่านั้น) |
| ผู้รับผิดชอบ | DevOps + Backend Dev |
| อ้างอิง | DevSpec Full §11,15 |
| ขึ้นกับ | INFRA-001, BE-001~012 |

## สรุป

Load testing + monitoring (Prometheus / Grafana / APM / alerts / reconcile job) **ไม่อยู่ในขอบเขตของ demo presentation** — เลื่อนไป production

## เฟสถัดไป (production เท่านั้น — ไม่ทำใน demo)

- จำลอง 500–1,000 concurrent users (k6 / Locust)
- Centralized logging + APM (latency / error rate / throughput)
- Alert: p95 latency / error rate เกิน threshold
- Dashboard + daily reconciliation job

| Endpoint | SLA p95 (เฟสถัดไป) |
|---------|---------|
| GET /books | ≤ 2.5s |
| GET /books/:id | ≤ 2.5s |
| GET content-url | ≤ 1s |
| เปิด EPUB ครั้งแรก | ≤ 4s |
| Error rate | < 0.5% |
