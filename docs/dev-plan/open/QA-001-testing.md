# QA-001 — Testing (ครบทุก FR)

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | QA Team |
| อ้างอิง | DevSpec Full §12, BackOffice §10, PRD §12 |
| ขึ้นกับ | BE-001~012, FE-001~010 |

## Test Cases ตาม FR

| FR | Test Scenario |
|----|--------------|
| FR-1 | สมัคร/ล็อกอิน/ต่ออายุ; รหัสผิด→401 |
| FR-2 | รายการ published เท่านั้น |
| FR-3 | ค้นหาเจอ/ไม่เจอ |
| FR-4 | ปุ่มเช่าไม่โผล่ถ้า price_rent=null |
| FR-5 | ซื้อ→สิทธิ์ถาวร |
| FR-6 | เช่า→สิทธิ์, expires=paid+7d, daysLeft ถูก |
| FR-7 | หมดอายุ→403 ทันที; cron เปลี่ยน→expired |
| FR-8 | paid→สิทธิ์; failed→ไม่มีสิทธิ์; webhook ซ้ำไม่สร้างซ้ำ |
| FR-9 | เปิดอ่าน+จำหน้า |
| FR-10 | ชั้นแยก owned/renting/expired |
| FR-11 | upload+submit→pending_review |
| FR-12 | ไม่มีสิทธิ์→403; ไม่มี EPUB public URL |
| FR-13 | wallet เริ่ม 0; balance=SUM(transactions) |
| FR-14 | เติม→coins+bonus ≤10s; ล้มเหลว→ไม่เปลี่ยน |
| FR-15 | จ่ายเหรียญพอ→ตัด; ไม่พอ→402; กดรัวไม่ตัดซ้ำ |
| FR-16 | ประวัติ balance_after ถูก |
| FR-17 | ทุก order_item paid มีส่วนแบ่ง; platform_cut+publisher_share=net |
| FR-18 | dashboard publisher ตรงกับ SUM order ของตน; เห็นแค่ของตน |
| FR-19 | ตะกร้าเพิ่ม/ลบ; checkout→สิทธิ์ครบ; เช่า→400 |
| FR-20 | publish→โผล่ร้าน; suspend→ถอดแต่ entitlement ไม่กระทบ; ทุก action มี audit_log |
| NFR-8 | wallet balance=SUM ส่วนต่าง=0 ทุกบัญชี |
| Security | publisher เรียก /admin→403; ส่ง publisher_id ปลอม→ถูกเพิกเฉย (IDOR) |

## เกณฑ์คุณภาพ

- [ ] Critical bugs = 0
- [ ] E2E วงจรหลัก (ค้นหา→ซื้อ→จ่าย→อ่าน) ผ่าน 100%
- [ ] E2E wallet (เติม→จ่ายเหรียญ→ได้สิทธิ์) ผ่าน 100%
- [ ] E2E backoffice (publisher submit→admin approve→ผู้ใช้เห็น) ผ่าน 100%
- [ ] Unit test coverage payment/wallet module ≥ 80%
- [ ] Reconciliation orders(paid) vs entitlements = 0 mismatch
- [ ] Reconciliation wallet balance vs ledger = 0 ทุกบัญชี

## Definition of Done

- [ ] Test suite รันใน CI
- [ ] ทุก FR มี test case
- [ ] IDOR test: publisher ไม่เห็นข้อมูลของรายอื่น
