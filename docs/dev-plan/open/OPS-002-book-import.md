# OPS-002 — Book Import & Launch Prep

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | DevOps + Admin |
| อ้างอิง | DevSpec Full §16 |
| ขึ้นกับ | BE-007, INFRA-001(S3) |

## เป้าหมาย

≥ 300–1,000 เล่ม (ตั้งเป้า ~500) พร้อมเปิดตัว

## งานที่ต้องทำ

- [ ] Bulk import script: CSV/JSON + EPUB → S3 + DB (idempotent)
- [ ] EPUB Validation: valid format, ≤50MB, มีปก/สารบัญ, เปิดได้จริง, ไทย ≥360px, สแกนไวรัส
- [ ] ตรวจทุกเล่ม published มีไฟล์บน S3 จริง
- [ ] ตั้งราคา/โหมดขาย (ซื้อ/เช่า) ครบ
- [ ] บันทึกข้อมูลสัญญา: revenue_share, exclusive, เลขสัญญา, ช่วงเวลา

## Definition of Done

- [ ] ≥ 300 เล่ม status=published ก่อนเปิดตัว
- [ ] Validation script ผ่านทุกเล่ม
- [ ] ไม่มีเล่ม published ที่ไม่มีไฟล์ S3
