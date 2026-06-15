# QA-001 — Testing (ครบทุก FR)

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | QA Team |
| อ้างอิง | DevSpec Full §12, PRD §12 |
| ขึ้นกับ | BE-001~011, FE-001~009 |

## Test Cases ตาม FR Mapping (§12)

| FR | Test Scenario |
|----|--------------|
| FR-1 | สมัคร/ล็อกอิน/ต่ออายุ; รหัสผิด→401 |
| FR-2 | รายการโชว์เฉพาะ published มีราคาซื้อ/เช่า |
| FR-3 | ค้นหาเจอ/ไม่เจอ (items=[]) |
| FR-4 | รายละเอียดแสดงปุ่มซื้อ+เช่าแยก; เล่มเช่าไม่ได้ไม่มีปุ่มเช่า |
| FR-5 | ซื้อสำเร็จ→สิทธิ์ถาวรในชั้นหนังสือ |
| FR-6 | เช่าสำเร็จ→สิทธิ์เช่า, หมดอายุ=จ่าย+7วัน, daysLeft ถูก |
| FR-7 | เลยกำหนด→ขอ content-url 403; cron เปลี่ยน→expired |
| FR-8 | บัตร/QR สำเร็จ→paid+สิทธิ์; ล้มเหลว→ไม่มีสิทธิ์; webhook ซ้ำไม่ทำซ้ำ |
| FR-9 | เปิดอ่าน+จำหน้าได้ (cfi บันทึก/โหลด) |
| FR-10 | ชั้นหนังสือแยก เจ้าของ/เช่า/หมดอายุ |
| FR-12 | ไม่มีสิทธิ์→403; ไม่มีลิงก์ EPUB สาธารณะ |
| FR-13 | กระเป๋าเริ่ม 0; ยอดตรงกับ SUM(transactions) |
| FR-14 | เติมแพ็กเกจ→coins+bonus ≤10วิ; ล้มเหลว→ยอดไม่เปลี่ยน |
| FR-15 | จ่ายเหรียญพอ→ตัด+ให้สิทธิ์; ไม่พอ→402; กดรัวไม่ตัดซ้ำ/ไม่ติดลบ |
| FR-16 | ประวัติแสดงเติม/ใช้/คืน + balance_after ถูกต้อง |
| FR-17 | ทุก order_item ที่ paid มีส่วนแบ่ง; platform_cut+publisher_share=net |
| FR-18 | หน้ารายได้ publisher ตรงกับ SUM(order) ของตน |
| FR-19 | ตะกร้าเพิ่ม/ลบ/กันซ้ำ; จ่ายรวม→สิทธิ์ครบ; เพิ่มเช่า→400 CART_BUY_ONLY |
| FR-20 | draft ไม่โผล่ร้าน; pending_review→publish→โผล่; suspend ไม่กระทบสิทธิ์เดิม |
| NFR-8 | เทียบยอดเหรียญทุกบัญชี: balance=SUM(amount), ส่วนต่าง=0 |

## เกณฑ์คุณภาพ (PRD §12)

- [ ] Critical bugs = 0
- [ ] E2E test วงจรหลัก (ค้นหา→ซื้อ→จ่าย→อ่าน) ผ่าน 100%
- [ ] E2E test เหรียญ (เติม→จ่ายด้วยเหรียญ→ได้สิทธิ์) ผ่าน 100%
- [ ] Unit test coverage โมดูล payment/revenue/wallet ≥ 80%
- [ ] Reconciliation: orders(paid) vs entitlements = 0 mismatches
- [ ] Reconciliation: wallet balance vs ledger SUM = 0 ต่างทุกบัญชี

## ประเภท Test

- [ ] **Unit tests** — service layer (payment calculation, revenue split, coin deduction)
- [ ] **Integration tests** — API endpoints ด้วย test database
- [ ] **E2E tests** — Sprint 1: ซื้อ→อ่าน / Sprint 2: เติมเหรียญ→จ่ายด้วยเหรียญ / Sprint 3: publisher submit→admin approve→ผู้ใช้เห็น
- [ ] **Security tests** — 403 ทุกกรณีไม่มีสิทธิ์, ไม่มี public EPUB URL, wallet ไม่ติดลบ

## Definition of Done

- [ ] Test suite รันใน CI อัตโนมัติ
- [ ] ทุก FR ใน §12 มี test case รองรับ
- [ ] Coverage report payment/wallet module ≥ 80%
