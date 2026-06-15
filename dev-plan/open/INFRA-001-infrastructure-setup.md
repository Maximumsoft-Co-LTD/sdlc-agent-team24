# INFRA-001 — Infrastructure Setup

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | DevOps |
| อ้างอิง | DevSpec §2, §11, NFR-1, NFR-2, NFR-4, NFR-7 |
| บล็อก | DB-001, BE-001~007, FE-001~005 ทั้งหมด |

## งานที่ต้องทำ

- [ ] ตั้ง PostgreSQL 15+ (primary + read replica)
- [ ] ตั้ง Redis (BullMQ + rate limiting + cache)
- [ ] สร้าง S3 bucket แบบ **private** (ไม่มี public URL)
- [ ] ตั้ง CDN สำหรับ cover image (ลิงก์ชั่วคราว)
- [ ] ตั้ง PgBouncer (connection pooling)
- [ ] สร้าง staging environment
- [ ] ตั้ง CI/CD pipeline (build → test → deploy)
- [ ] ตั้ง Docker + docker-compose สำหรับ local dev
- [ ] ตั้ง load balancer (API: 2–3 instances)
- [ ] ตั้ง monitoring: log aggregation + APM (NFR-7)
- [ ] เก็บ secrets ใน secret manager (ห้ามใส่ใน env file ตรงๆ)
- [ ] ตั้ง HTTPS ทุก endpoint (NFR-4)

## ขนาดเครื่องเริ่มต้น

| ส่วน | Spec |
|------|------|
| API server | 2–3 instances, 2 vCPU / 4GB |
| PostgreSQL | 4 vCPU / 16GB + read replica |
| Redis | 1 instance, 2GB |
| Worker (BullMQ) | 1 instance, แยกจาก API |

## Environment Variables ที่ต้องตั้ง

```
DATABASE_URL, REDIS_URL
JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
ACCESS_TTL=15m, REFRESH_TTL=30d
S3_BUCKET, S3_REGION, S3_ACCESS_KEY, S3_SECRET, SIGNED_URL_TTL=900
PAYMENT_PROVIDER, PAYMENT_PUBLIC_KEY, PAYMENT_SECRET_KEY, PAYMENT_WEBHOOK_SECRET
GATEWAY_FEE_RATE=0.03, DEFAULT_PUBLISHER_SHARE=0.70
RENTAL_EXPIRY_CRON="*/15 * * * *"
```

## Definition of Done

- [ ] ทีม Dev สามารถ `docker-compose up` แล้วรัน local ได้ครบ
- [ ] CI/CD รัน build + test อัตโนมัติเมื่อมี PR
- [ ] Staging environment เข้าถึงได้จากทีม
