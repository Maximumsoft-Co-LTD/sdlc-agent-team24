# Read24 — Tech Stack (Demo)

> Stack หลัก: **Next.js (full-stack: หน้าเว็บ + API) + MongoDB (ฐานข้อมูล)** — ใช้ Next.js ตัวเดียวทำทั้ง frontend และ backend ผ่าน API Routes / Route Handlers ไม่ต้องแยก service ภาษาอื่น · ทุกตัวเป็น open-source หรือมี free tier · ส่วนการจ่ายเงิน/เติมเหรียญใช้ **mock** ไม่ต่อ payment gateway จริง

| ส่วน | เครื่องมือที่ใช้ | ใช้ทำอะไร / เหตุผล | ฟรีอย่างไร |
|---|---|---|---|
| หน้าเว็บ + API (Full-stack) | **Next.js** (React + TypeScript) responsive | สร้าง UI ผู้ใช้/สำนักพิมพ์/แอดมิน + เขียน backend API ในตัว (Route Handlers / API Routes) — auth, catalog, order, wallet, publisher, admin อยู่ใน Next.js ทั้งหมด ไม่ต้องมี service แยก | MIT license — ฟรี 100% |
| ตัวอ่าน E-book | **`epub.js`** | เรนเดอร์ไฟล์ EPUB ในเบราว์เซอร์ผ่านลิงก์ชั่วคราว (FR-9,12) | open-source ฟรี |
| ฐานข้อมูล (DB) | **MongoDB** (Community 6.0+ / Atlas Free Tier M0) | เก็บข้อมูลทั้งหมด: ผู้ใช้, หนังสือ, คำสั่งซื้อ, สิทธิ์, กระเป๋าเหรียญ+ledger, ตะกร้า, ส่วนแบ่ง | Community Edition = ฟรี (self-host) · Atlas M0 = ฟรีถาวร 512MB |
| Driver เชื่อม DB | **mongodb** (Node.js driver ทางการ) หรือ **Mongoose** | ให้ Next.js คุยกับ MongoDB จากฝั่ง server | Apache-2.0 / MIT ฟรี |
| ที่เก็บไฟล์ | **MinIO** (รันเป็น Docker container, S3-compatible) | เก็บไฟล์ EPUB/ปก + ออกลิงก์ให้ผู้มีสิทธิ์ · รันใน `docker-compose` เดียวกับ MongoDB เก็บไฟล์ใน Docker volume — **ไม่ต่อ cloud ไม่เสียเงิน** · โค้ดเป็น S3-compatible อยู่แล้ว ย้ายไป R2/S3 จริงทีหลังแค่เปลี่ยน endpoint | MinIO = open-source ฟรี |
| ล็อกอิน (Auth) | **JWT** (`jsonwebtoken`) + **Argon2id** (`argon2`) | ออก/ตรวจ token และแฮชรหัสผ่าน (NFR-4) · demo ใช้ access token พอ ไม่ทำ refresh rotation | ไลบรารี Node ฟรีทั้งคู่ |
| จ่ายเงิน / เติมเหรียญ | **Mock** (ไม่ต่อ gateway จริง) | กด "จ่าย"/"เติมเหรียญ" → สำเร็จทันที ออก entitlement / เพิ่มเหรียญในคำขอเดียว · ออกแบบเป็น adapter เผื่อสลับเป็น Stripe/Omise ภายหลัง | ฟรี — ไม่มีการเชื่อมต่อภายนอก |

> **หมายเหตุเรื่อง "ฟรี":** องค์ประกอบหลัก (Next.js, MongoDB, MinIO) เป็น open-source รันบนเครื่องเราเองได้โดยไม่เสียค่า license · ส่วนคลาวด์ (Atlas M0) เลือก free tier ได้ · **ไม่มี payment gateway** ใน demo — ใช้ mock ทั้งหมด

---

## ถูกตัดออกจาก Demo (เทียบกับแผนเต็มเดิม)

> ของพวกนี้ไม่จำเป็นต่อการนำเสนอ — ถ้าจะขึ้น production ค่อยเพิ่มกลับ

| ของเดิม | ทำไมตัด |
|--------|---------|
| **Go + Fiber/Gin (backend แยก)** | รวมมาเป็น Next.js API ตัวเดียว — ลดความซับซ้อน ไม่ต้องดูแล 2 ภาษา/2 service |
| **Payment gateway (Omise/Stripe)** + webhook | ใช้ mock — ไม่ต้องเคาะเจ้า, ไม่ต้อง sandbox key, ไม่ต้องตั้ง webhook |
| **asynq + Redis (job/queue/cache)** | demo ไม่ต้องมี background job — สิทธิ์เช่าหมดอายุเช็คแบบ lazy ตอนเปิดอ่านแทน |
| **Prometheus + Grafana / Sentry (monitoring)** | ไม่เกี่ยวกับการนำเสนอ |
| **Cloudflare R2 / CDN + presigned URL จริง** | demo ใช้ MinIO local หรือ static folder ก็พอ |

---

## MongoDB กับงานเงิน (demo) — พอแม่นพอโชว์

> demo ไม่ต้องเข้มเท่า production แต่ยังควรใช้แนวทางนี้กันยอดเพี้ยน:

- **ตัดเหรียญแบบ atomic กันติดลบ:** ใช้ `updateOne({_id, balance: {$gte: amount}}, {$inc: {balance: -amount}})` แล้วเช็ก `modifiedCount` — ถ้า 0 แปลว่าเหรียญไม่พอ
- **เก็บ ledger:** ทุกการเปลี่ยนยอดเขียนแถวใน `wallet_transactions` ไว้ (ยังไม่ต้องมี reconcile job ใน demo)
- **ความสัมพันธ์ระหว่าง collection:** บังคับความถูกต้องที่ชั้น application + ใช้ unique index กันข้อมูลซ้ำ (เช่น สิทธิ์ซ้ำ, ตะกร้าซ้ำ)
- **Transaction (ถ้าใช้ Atlas M0 / replica set):** ห่อขั้นตอน "ตัดเหรียญ + ออกสิทธิ์" ให้ atomic ได้ — แต่ถ้ารัน MongoDB single-node ใน demo จะตัดทีละขั้นก็ยอมรับได้
