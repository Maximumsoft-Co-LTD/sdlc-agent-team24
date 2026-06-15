# OPS-002 — Book Import & Launch Prep

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | DevOps + Admin |
| อ้างอิง | DevSpec §17 |
| ขึ้นกับ | BE-007, INFRA-001 (S3) |

## เป้าหมาย

อย่างน้อย **300–1,000 เล่ม** (ตั้งเป้า ~500) พร้อมเปิดตัว

## งานที่ต้องทำ

### Import Script (§17.2)
- [ ] สร้าง bulk import script: รับ CSV/JSON metadata + ไฟล์ EPUB
- [ ] อัปโหลด EPUB ขึ้น S3 private bucket
- [ ] Insert ข้อมูลหนังสือ + publishers ลง DB
- [ ] Script รัน idempotent ได้ (ไม่ duplicate ถ้ารันซ้ำ)

### EPUB Validation (§17.4)
- [ ] ตรวจว่าเป็นไฟล์ EPUB format ที่ถูกต้อง
- [ ] ขนาด ≤ 50MB
- [ ] มีปก (cover image)
- [ ] มีสารบัญ (toc)
- [ ] เปิดอ่านได้จริงใน epub.js (render test)
- [ ] ฟอนต์ไทย/การจัดหน้าถูกต้อง ≥ 360px
- [ ] สแกนไวรัส (ถ้ามี tool)

### Pre-launch Verification (§17.7)
- [ ] ทุกเล่มที่ published มีไฟล์ EPUB บน S3 จริง
- [ ] ราคา + โหมดขาย (ซื้อ/เช่า) ครบทุกเล่ม
- [ ] เล่มที่เช่าไม่ได้ (price_rent=null) ไม่แสดงปุ่มเช่า
- [ ] เล่มเจ้าเดียว (exclusive) ติด flag ถูกต้อง

### Contract Data (§17.5)
- [ ] บันทึกข้อมูลสัญญาสำนักพิมพ์: revenue_share, exclusive flag, เลขอ้างอิงสัญญา, ช่วงเวลา

## Definition of Done

- [ ] มีหนังสือ ≥ 300 เล่ม status=published ก่อนวันเปิดตัว
- [ ] Validation script ผ่านทุกเล่ม
- [ ] ไม่มีเล่ม published ที่ไม่มีไฟล์บน S3
