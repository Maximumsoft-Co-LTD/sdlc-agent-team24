# INFRA-001 — Infrastructure Setup

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | DevOps |
| อ้างอิง | DevSpec Full §2, NFR-1,2,4,7 |
| บล็อก | ทุก task ในระบบ |

## งานที่ต้องทำ

- [ ] PostgreSQL 15+ (primary + read replica + PgBouncer)
- [ ] Redis (BullMQ + rate limiting + cache + dashboard cache)
- [ ] S3 bucket **private** + CDN สำหรับ cover/EPUB
- [ ] Staging environment
- [ ] CI/CD pipeline (build → test → deploy)
- [ ] Docker + docker-compose สำหรับ local dev
- [ ] Load balancer (API: 2–3 stateless instances)
- [ ] Monitoring: log aggregation + APM (NFR-7)
- [ ] Secrets ใน secret manager (ห้ามใส่ใน .env ตรงๆ)
- [ ] HTTPS ทุก endpoint (NFR-4)
- [ ] MFA สำหรับบัญชี admin (BackOffice §9 — แนะนำ)

## ขนาดเครื่องเริ่มต้น

| ส่วน | Spec |
|------|------|
| API server | 2–3 instances, 2 vCPU/4GB |
| PostgreSQL | 4 vCPU/16GB + read replica (สำหรับ dashboard queries) |
| Redis | 2GB |
| Worker (BullMQ) | แยกจาก API |

## Definition of Done

- [ ] `docker-compose up` → local dev ทำงานครบ
- [ ] CI/CD รัน build + test อัตโนมัติ
- [ ] Staging เข้าถึงได้จากทีม
