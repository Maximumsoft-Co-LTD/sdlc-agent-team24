# Read24 — Tech Stack

> Stack หลัก: **Next.js (หน้าเว็บ) + Go (หลังบ้าน) + MongoDB (ฐานข้อมูล)** — ทุกตัวเป็น open-source หรือมี free tier ใช้งานได้จริง ไม่มีค่าใช้จ่ายบังคับ ส่วนกระเป๋าเหรียญ (ต้องแม่นเรื่องยอด) ใช้ MongoDB transaction + ledger เป็นพิเศษ

| ส่วน | เครื่องมือที่ใช้ | ใช้ทำอะไร / เหตุผล | ฟรีอย่างไร |
|---|---|---|---|
| หน้าเว็บ (Frontend) | **Next.js** (React + TypeScript) responsive | สร้าง UI ผู้ใช้/สำนักพิมพ์/แอดมิน เป็นเว็บก่อน รองรับ SSR/SEO, routing, API route ในตัว | MIT license — ฟรี 100% |
| ตัวอ่าน E-book | **`epub.js`** | เรนเดอร์ไฟล์ EPUB ในเบราว์เซอร์ผ่านลิงก์ชั่วคราว (FR-9,12) | open-source ฟรี |
| หลังบ้าน (Backend) | **Go** + framework **Fiber** หรือ **Gin** (REST API) | ตัว API หลักทั้งหมด — auth, catalog, order, wallet, publisher, admin · Go คอมไพล์เป็น binary เดียว รันเร็ว กิน RAM น้อย เหมาะกับงานพร้อมกันเยอะ (concurrency) | Go + Fiber/Gin เป็น open-source ฟรี |
| ฐานข้อมูล (DB) | **MongoDB** (Community 6.0+ / Atlas Free Tier M0) | เก็บข้อมูลทั้งหมด: ผู้ใช้, หนังสือ, คำสั่งซื้อ, สิทธิ์, กระเป๋าเหรียญ+ledger, ตะกร้า, ส่วนแบ่ง · ใช้ **multi-document transaction** กับงานเงิน/เหรียญให้ atomic | Community Edition = ฟรี (self-host) · Atlas M0 = ฟรีถาวร 512MB |
| Driver เชื่อม DB | **mongo-go-driver** (ทางการของ MongoDB) | ให้ Go คุยกับ MongoDB + ใช้ session/transaction | Apache-2.0 ฟรี |
| ที่เก็บไฟล์ + CDN | **MinIO** (self-host) หรือ **Cloudflare R2** (free tier) | เก็บไฟล์ EPUB/ปก แบบ private + ออกลิงก์ชั่วคราว (presigned URL) · ทั้งคู่ S3-compatible ใช้โค้ดเดิมได้ | MinIO = open-source ฟรี · R2 = ฟรี 10GB + ไม่มีค่า egress |
| ล็อกอิน (Auth) | **JWT** (`golang-jwt`) + **Argon2id** (`golang.org/x/crypto/argon2`) | ออก/ตรวจ access+refresh token และแฮชรหัสผ่านแบบปลอดภัย (NFR-4) | ไลบรารี Go ฟรีทั้งคู่ |
| จ่ายเงิน | **Omise / Stripe** (บัตร + QR PromptPay) ผ่าน adapter | รับชำระเงินจริง · ออกแบบเป็น adapter เปลี่ยนเจ้าได้ | **sandbox/test mode ฟรี** — เสียค่าธรรมเนียมเฉพาะตอนรับเงินจริง · **เคาะเจ้าก่อน (PRD Q-1)** |
| งานเบื้องหลัง (Jobs) | **asynq** (Go + Redis) หรือ **robfig/cron** | ตัดสิทธิ์เช่าหมดอายุ, เทียบยอดเหรียญ, แจ้งเตือน · `robfig/cron` ทำงานในโปรเซส Go ได้เลยถ้าไม่อยากใช้ Redis | asynq/cron = ฟรี · Redis Community = ฟรี |
| คิว/แคช | **Redis** (Community) | คิวงานของ asynq + แคชรายการหนังสือ | open-source ฟรี (หรือ Upstash free tier) |
| มอนิเตอร์ | **Prometheus + Grafana** หรือ **Sentry** (free tier) | เก็บ log/metric, ติดตาม error (NFR-7) | Prometheus/Grafana = open-source ฟรี · Sentry = free tier |

> **หมายเหตุเรื่อง "ฟรี":** ทุกองค์ประกอบหลัก (Next.js, Go, MongoDB, MinIO, Redis) เป็น open-source รันบนเครื่อง/เซิร์ฟเวอร์ของเราเองได้โดยไม่เสียค่า license · ส่วนที่เป็น "บริการคลาวด์" (Atlas, R2, Sentry) เลือกใช้ free tier ได้ในช่วง MVP · มีแค่ **payment gateway** เท่านั้นที่เก็บค่าธรรมเนียมตอนรับเงินจริง (test mode ฟรี)

---

## MongoDB กับงานเงิน — ทำให้เชื่อถือได้

> เดิมสเปกพึ่ง PostgreSQL เรื่องความถูกต้องของเงิน — เมื่อใช้ MongoDB ต้องใช้ความสามารถเหล่านี้แทน:

- **Multi-document transactions:** MongoDB 4.0+ (ต้องรันแบบ replica set — Atlas M0 เป็น replica set อยู่แล้ว) รองรับทรานแซกชัน ACID ข้ามหลาย document → ใช้ห่อขั้นตอน "ตัดเหรียญ + ออกสิทธิ์ + บันทึกส่วนแบ่ง" ให้สำเร็จหรือล้มเหลวพร้อมกัน
- **ตัดเหรียญแบบ atomic กันติดลบ:** ใช้ `updateOne({_id, balance: {$gte: amount}}, {$inc: {balance: -amount}})` แล้วเช็ก `modifiedCount` — ถ้า 0 แปลว่าเหรียญไม่พอ (แทน `WHERE balance>=amount` ของ SQL)
- **กันตัดซ้ำ (idempotency):** สร้าง **unique index** บน `idempotency_key` ของรายการ ledger → ยิงซ้ำจะ insert ไม่ผ่าน (E11000) ไม่ตัดเหรียญรอบสอง
- **ความสัมพันธ์ระหว่างตาราง:** MongoDB ไม่มี foreign key จริง → บังคับความถูกต้องที่ชั้น application + ใช้ unique index ป้องกันข้อมูลซ้ำ (เช่น สิทธิ์ซ้ำ, ตะกร้าซ้ำ)
