# Read24 — Cloud Run Deployment Plan

> **เป้าหมาย:** Deploy `repos/read24` (Next.js 14) ขึ้น Google Cloud Run — build & run คำสั่งเดียวจบ
>
> **Stack อ้างอิง:** ดู [`TechStack.md`](./TechStack.md)
>
> **GCP Project:** `k8s-ms-381210` (region: `asia-southeast1`)
>
> **Storage:** GCS (S3-compatible via HMAC) แทน MinIO local
> **Database:** MongoDB Atlas (มีอยู่แล้ว — รอ connection string)

---

## 📁 ไฟล์ที่เตรียมไว้แล้วใน `repos/read24/`

| ไฟล์ | ทำอะไร |
|---|---|
| `Dockerfile` | Multi-stage build (deps → builder → runner) รองรับ argon2 native module |
| `.dockerignore` | กัน node_modules / .env / docs / docker-compose จาก image |
| `next.config.js` | เพิ่ม `output: 'standalone'` + remotePatterns สำหรับ GCS |
| `.env.production.example` | Template env vars สำหรับ Cloud Run |
| `scripts/setup-gcp.sh` | One-time setup: APIs + Artifact Registry + GCS bucket |
| `scripts/deploy.sh` | Deploy คำสั่งเดียว — รัน `gcloud run deploy --source .` |

---

## 🗺️ Architecture บน Cloud Run

```
            [Internet]
                │ HTTPS
                ▼
    ┌───────────────────────┐
    │  Cloud Run            │
    │  read24 (Next.js)     │ ◄── Secrets (Secret Manager)
    │  asia-southeast1      │      • MONGODB_URI
    └─────┬─────────────┬───┘      • JWT_SECRET / REFRESH_TOKEN_SECRET
          │             │           • MINIO_ACCESS_KEY / SECRET_KEY (GCS HMAC)
          │             │
          ▼             ▼
   [MongoDB Atlas]  [GCS bucket]
   (external)       read24-files
                    (S3-compatible)
```

**สำคัญ:** โค้ดใน `src/lib/minio.ts` ใช้ AWS SDK ตรงๆ ที่ S3-compatible — ชี้ไป GCS ได้เลย โดยไม่ต้องแก้โค้ดธุรกิจ

---

## 📋 Phase 1: เตรียม GCP (ครั้งเดียว ~10 นาที)

```bash
# Login + ตั้ง project
gcloud auth login
gcloud auth application-default login
gcloud config set project k8s-ms-381210

# รัน setup script (จะเปิด APIs + สร้าง Artifact Registry + GCS bucket)
cd repos/read24
./scripts/setup-gcp.sh
```

จากนั้นทำ 3 อย่างที่ script จะบอก:
1. **สร้าง Secrets** (MONGODB_URI, JWT_SECRET, REFRESH_TOKEN_SECRET)
2. **สร้าง GCS HMAC key** ผ่าน Console → เก็บเป็น secret 2 ตัว
3. **ให้ IAM permission** Cloud Run SA อ่าน secret

---

## 📋 Phase 2: GCS HMAC Key (สำคัญ — ทำผ่าน Console)

GCS รองรับ S3-compatible API แต่ต้องสร้าง HMAC key ก่อน:

1. ไป https://console.cloud.google.com/storage/settings → tab **Interoperability**
2. กด **"Create a key for a service account"**
3. เลือก/สร้าง SA ที่มี role `Storage Object Admin` ใน bucket `read24-files`
4. คัดลอก **Access key** + **Secret** มาเก็บใน Secret Manager:
   ```bash
   echo -n "GOOG..." | gcloud secrets create read24-gcs-access-key --data-file=-
   echo -n "..."     | gcloud secrets create read24-gcs-secret-key --data-file=-
   ```

---

## 📋 Phase 3: Deploy

```bash
cd repos/read24
./scripts/deploy.sh
```

Script จะ:
1. Cloud Build build Docker image จาก `Dockerfile`
2. Push เข้า Artifact Registry
3. Deploy ขึ้น Cloud Run พร้อม secrets + env vars
4. Print URL ที่ใช้งานได้ (เช่น `https://read24-xxxxx-as.a.run.app`)

หลัง deploy ครั้งแรก — set `NEXT_PUBLIC_APP_URL` ให้ตรง URL จริง (script บอกคำสั่ง)

---

## 🔍 ปรับโค้ดอะไรไปบ้าง (เทียบกับโปรเจกต์เดิม)

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `next.config.js` | + `output: 'standalone'` + GCS remotePatterns |
| `Dockerfile` | **ใหม่** — multi-stage, node:20-alpine, argon2 build deps |
| `.dockerignore` | **ใหม่** |
| `.env.production.example` | **ใหม่** — template สำหรับ Cloud Run env |
| `scripts/setup-gcp.sh` | **ใหม่** |
| `scripts/deploy.sh` | **ใหม่** |
| `src/lib/minio.ts` | ❌ ไม่แก้ — ใช้ค่าเดียวกัน แค่เปลี่ยน env เป็น GCS endpoint |
| `src/lib/mongodb.ts` | ❌ ไม่แก้ — รับ Atlas URI ได้เลย |

---

## ⚠️ ข้อจำกัด Cloud Run ที่กระทบ Read24

| ข้อจำกัด | ค่า | ผลกับ Read24 | ทางแก้ |
|---|---|---|---|
| Request body | 32MB (HTTP/1) | Upload EPUB ใหญ่ผ่าน API ปกติไม่ได้ | ✅ โค้ดใช้ presigned URL upload ตรง GCS อยู่แล้ว |
| Stateless | ไม่มี disk | seed/temp files หาย | ✅ ไม่กระทบ — seed ผ่าน API call |
| Cold start | 2-5s | request แรกช้า | ตั้ง `--min-instances=1` ถ้าจำเป็น (เสียเงิน) |
| Timeout | default 5 min | งานยาวจะถูกตัด | script ตั้ง `--timeout=300` ไว้แล้ว |

---

## 💰 ค่าใช้จ่ายโดยประมาณ (demo)

| รายการ | ค่าใช้จ่าย |
|---|---|
| Cloud Run | **฿0** — 2M requests/เดือนแรกฟรี |
| Cloud Build | **฿0** — 120 build-min/วันฟรี |
| Artifact Registry | ~฿3/เดือน |
| Secret Manager | **฿0** (5 secrets, < free tier) |
| GCS (read24-files) | **฿0** — 5GB ฟรี |
| MongoDB Atlas M0 | **฿0** ฟรีถาวร |
| **รวม demo** | **~฿3/เดือน** |

---

## 🔄 Operations หลัง deploy

```bash
# อัพเดต code → redeploy
./scripts/deploy.sh

# ดู logs
gcloud run services logs tail read24 --region asia-southeast1

# ดู revisions
gcloud run revisions list --service=read24 --region=asia-southeast1

# Rollback ไป revision ก่อนหน้า
gcloud run services update-traffic read24 \
  --to-revisions=read24-00001-xxx=100 \
  --region=asia-southeast1
```

---

## 🚨 Seed Database (production)

โปรเจกต์มี seed API ที่ block ใน production (`src/app/api/v1/seed/route.ts:5`):

```ts
if (process.env.NODE_ENV === 'production') { ... }
```

ถ้าจะ seed บน Cloud Run มี 2 ทาง:
- **A)** Deploy ด้วย `NODE_ENV=development` ครั้งแรก, seed, แล้ว redeploy เป็น production
- **B)** ปลดเงื่อนไขใน `route.ts` ชั่วคราว แล้วใส่กลับ
- **C)** รัน `npm run seed` จากเครื่อง local ชี้ไป Atlas URI โดยตรง ← **แนะนำ**

---

## 📌 Next Actions

- [ ] รับ MongoDB Atlas connection string จากผู้ใช้
- [ ] `gcloud auth login`
- [ ] รัน `./scripts/setup-gcp.sh`
- [ ] สร้าง GCS HMAC key ผ่าน Console
- [ ] สร้าง 5 secrets ใน Secret Manager
- [ ] รัน `./scripts/deploy.sh`
- [ ] Seed Atlas จาก local: `MONGODB_URI=<atlas-uri> npm run seed`

---

**Related:**
- [`TechStack.md`](./TechStack.md) — Stack overview
- [`repos/read24/README-SETUP.md`](../../repos/read24/README-SETUP.md) — Local dev setup
