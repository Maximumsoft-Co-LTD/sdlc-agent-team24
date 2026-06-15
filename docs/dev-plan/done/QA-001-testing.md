# QA-001 — Testing (Demo Smoke / E2E)

| Field | Value |
|-------|-------|
| สถานะ | done |
| ผู้รับผิดชอบ | QA Team |
| อ้างอิง | DevSpec Full §12, BackOffice §10, PRD §12 |
| ขึ้นกับ | BE-001~012, FE-001~010 |

> หมายเหตุ: payment / topup เป็น mock (สำเร็จทันที) — ดู INFRA-002

## Test Cases ตาม FR (checklist)

| FR | Test Scenario |
|----|--------------|
| FR-1 | สมัคร/ล็อกอิน/ต่ออายุ; รหัสผิด→401 |
| FR-2 | รายการ published เท่านั้น |
| FR-3 | ค้นหาเจอ/ไม่เจอ |
| FR-4 | ปุ่มเช่าไม่โผล่ถ้า price_rent=null |
| FR-5 | ซื้อ→สิทธิ์ถาวร |
| FR-6 | เช่า→สิทธิ์, expires=paid+7d, daysLeft ถูก |
| FR-7 | หมดอายุ→403 ทันที; cron เปลี่ยน→expired |
| FR-8 | paid→สิทธิ์; failed→ไม่มีสิทธิ์; เรียกซ้ำไม่สร้างซ้ำ |
| FR-9 | เปิดอ่าน+จำหน้า |
| FR-10 | ชั้นแยก owned/renting/expired |
| FR-11 | upload+submit→pending_review |
| FR-12 | ไม่มีสิทธิ์→403; ไม่มี EPUB public URL |
| FR-13 | wallet เริ่ม 0; balance=SUM(transactions) |
| FR-14 | เติม(mock)→coins+bonus; ล้มเหลว→ไม่เปลี่ยน |
| FR-15 | จ่ายเหรียญพอ→ตัด; ไม่พอ→402; กดรัวไม่ตัดซ้ำ |
| FR-16 | ประวัติ balance_after ถูก |
| FR-17 | ทุก order_item paid มีส่วนแบ่ง; platform_cut+publisher_share=net |
| FR-18 | dashboard publisher ตรงกับ SUM order ของตน; เห็นแค่ของตน |
| FR-19 | ตะกร้าเพิ่ม/ลบ; checkout→สิทธิ์ครบ; เช่า→400 |
| FR-20 | publish→โผล่ร้าน; suspend→ถอดแต่ entitlement ไม่กระทบ; ทุก action มี audit_log |
| Security | publisher เรียก /admin→403; ส่ง publisher_id ปลอม→ถูกเพิกเฉย (IDOR) |

## Definition of Done

วงจร demo หลักผ่านครบ 1 รอบ:

- [x] (1) register → browse → ซื้อ/เช่า (mock) → อ่าน
- [x] (2) wallet เติม (mock) → จ่ายเหรียญ
- [x] (3) publisher submit → admin approve → ผู้ใช้เห็น
- [x] IDOR / security spot-check: publisher ไม่เห็นข้อมูลของรายอื่น

## Smoke Test Artifacts

Test files written to `/tests/smoke/`:

| File | FR Covered |
|------|------------|
| `auth.smoke.test.ts` | FR-1 |
| `books.smoke.test.ts` | FR-2, FR-3, FR-4 |
| `orders.smoke.test.ts` | FR-5, FR-6, FR-8, FR-10 |
| `wallet.smoke.test.ts` | FR-13, FR-14, FR-15, FR-16 |
| `cart.smoke.test.ts` | FR-19 |
| `backoffice.smoke.test.ts` | FR-11, FR-17, FR-18, FR-20, Security |
