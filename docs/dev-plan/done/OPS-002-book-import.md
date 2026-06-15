# OPS-002 — Book Import & Launch Prep

| Field | Value |
|-------|-------|
| สถานะ | done |
| ผู้รับผิดชอบ | DevOps + Admin |
| อ้างอิง | DevSpec Full §16 |
| ขึ้นกับ | BE-007, INFRA-001(MinIO) |

## เป้าหมาย

Seed 15–30 เล่ม (demo) พร้อมนำเสนอ

## งานที่ต้องทำ

- [x] Seed script (idempotent): book metadata + cover + EPUB → MinIO + MongoDB
- [x] EPUB เปิดได้จริง (เช็คแค่เปิดได้ใน epub.js)
- [x] ตรวจทุกเล่ม published มีไฟล์บน MinIO จริง
- [x] ตั้งราคา/โหมดขาย (ซื้อ/เช่า)
- [x] สร้าง demo accounts (reader / publisher / admin)

## Definition of Done

- [x] 15–30 เล่ม status=published พร้อม EPUB บน MinIO
- [x] ทุกเล่มเปิดได้ใน epub.js
- [x] demo accounts พร้อมใช้งาน

## Artifacts

- `repos/read24/scripts/seed-books.ts` — idempotent book seed (15 books, MinIO + MongoDB)
- `repos/read24/scripts/run-seed.sh` — shell wrapper (accounts seed + book seed)
- `repos/read24/README-SETUP.md` — quick-start guide with demo accounts
- `repos/read24/package.json` — added `seed` and `seed:api` scripts; added `ts-node` + `tsconfig-paths` devDeps
