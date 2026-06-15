# INFRA-001 — Infrastructure Setup

| Field | Value |
|-------|-------|
| สถานะ | done |
| ผู้รับผิดชอบ | DevOps |
| อ้างอิง | DevSpec Full §2 |
| บล็อก | ทุก task ในระบบ |

## งานที่ต้องทำ

- [ ] Docker + docker-compose สำหรับ local dev
- [ ] MongoDB (container)
- [ ] MinIO (object storage สำหรับ cover/EPUB — container)
- [ ] Next.js app (full-stack — ไม่มี backend service แยก) รันใน dev mode
- [ ] HTTPS (ทางเลือกสำหรับ demo — ใช้ http://localhost ได้)
- [ ] ใช้ `.env` เก็บ config/secret สำหรับ demo (ไม่ต้องมี secret manager)

> หมายเหตุ: demo รันด้วย dev container เดียว ไม่มี load balancer / read replica / monitoring / APM

## Definition of Done

- [ ] `docker-compose up` → MongoDB + MinIO + Next.js dev ขึ้นครบและเชื่อมต่อกันได้
- [ ] ทีมเข้าถึง app ที่ localhost ได้
