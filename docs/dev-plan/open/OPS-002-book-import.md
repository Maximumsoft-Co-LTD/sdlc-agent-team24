# OPS-002 — Book Import & Launch Prep

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | DevOps + Admin |
| อ้างอิง | DevSpec Full §16 |
| ขึ้นกับ | BE-007, INFRA-001(MinIO) |

## เป้าหมาย

Seed 15–30 เล่ม (demo) พร้อมนำเสนอ

## งานที่ต้องทำ

- [ ] Seed script (idempotent): book metadata + cover + EPUB → MinIO + MongoDB
- [ ] EPUB เปิดได้จริง (เช็คแค่เปิดได้ใน epub.js)
- [ ] ตรวจทุกเล่ม published มีไฟล์บน MinIO จริง
- [ ] ตั้งราคา/โหมดขาย (ซื้อ/เช่า)
- [ ] สร้าง demo accounts (reader / publisher / admin)

## Definition of Done

- [ ] 15–30 เล่ม status=published พร้อม EPUB บน MinIO
- [ ] ทุกเล่มเปิดได้ใน epub.js
- [ ] demo accounts พร้อมใช้งาน
