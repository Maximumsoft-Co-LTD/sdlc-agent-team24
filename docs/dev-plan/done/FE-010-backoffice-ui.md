# FE-010 — Back Office UI (Admin + Publisher)

| Field | Value |
|-------|-------|
| สถานะ | done |
| Sprint | 3 |
| ผู้รับผิดชอบ | Frontend Dev |
| อ้างอิง | BackOffice Spec §3, §7, §9, FR-11, FR-17, FR-18, FR-20 |
| ขึ้นกับ | BE-010, BE-011, BE-012, FE-001 |
| อ่านประกอบ | `Read24 (1).html` (หน้าตา back office) |

## งานที่ต้องทำ

### Admin: `/admin/dashboard` — แดชบอร์ดภาพรวม
- [x] การ์ดสรุป: GMV, ส่วนแบ่ง Read24, ส่วนแบ่งสำนักพิมพ์ + % เทียบเดือนก่อน
- [x] กราฟ bar chart: ยอดขายรายเดือน (แยก platform / publisher)
- [x] การ์ด: จำนวนเล่มแยกตาม status (published / pending_review / draft / suspended)
- [x] ตาราง: รายการสั่งซื้อล่าสุด + audit log ล่าสุด
- [x] Date range picker (from / to)

### Admin: `/admin/books` — จัดการหนังสือทั้งระบบ
- [x] ตาราง + filter by status, publisher
- [x] ปุ่ม publish / reject / suspend พร้อม confirmation dialog
- [x] Rejection reason modal input

### Admin: `/admin/revenue` — ส่วนแบ่งรายได้
- [x] สรุป: GMV → หักค่าธรรมเนียม → net → แบ่ง Read24 / สำนักพิมพ์
- [x] ตารางแยกตามสำนักพิมพ์
- [x] Date range filter
- [x] ปุ่ม Export CSV

### Admin: `/admin/publishers` — จัดการสำนักพิมพ์
- [x] รายชื่อสำนักพิมพ์ + revenue_share + bookCount + totalEarnings
- [x] แก้ไข revenue_share ได้ (พร้อม confirm)

### Admin: `/admin/audit-logs` — บันทึกการกระทำ
- [x] ตาราง: actor, action, target, note, เวลา — paginated
- [x] Filter by action type

### Publisher: `/publisher/dashboard` — แดชบอร์ดของฉัน
- [x] การ์ด: ยอดขายรวม, ส่วนแบ่งที่ได้, จำนวนเล่ม, จำนวนที่ขาย/เช่า
- [x] Date range picker

### Publisher: `/publisher/books` — หนังสือของฉัน
- [x] แสดง rejection reason ชัดเจน + ปุ่ม "แก้ไขและส่งใหม่"
- [x] ตัวคำนวณส่วนแบ่งสดในฟอร์ม (ใส่ราคา → โชว์ได้รับ 70%)

### Publisher: `/publisher/layout` — Route guard
- [x] Publisher layout พร้อม nav

### Publisher: `/publisher/revenue` — รายได้ละเอียด
- [x] รายละเอียดส่วนแบ่งต่อเล่ม + ช่วงเวลา
- [x] ปุ่ม Export CSV

## Security UX
- [x] Admin route guard: redirect ถ้า role ≠ admin
- [x] Publisher route guard: redirect ถ้า role ≠ publisher

## Definition of Done
- [x] Dashboard ตัวเลขตรงกับ BE API
- [x] Export CSV ดาวน์โหลดได้ถูกต้อง
- [x] Publisher เข้า `/admin/*` → redirect 403
