# FE-010 — Back Office UI (Admin + Publisher)

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 3 |
| ผู้รับผิดชอบ | Frontend Dev |
| อ้างอิง | BackOffice Spec §3, §7, §9, FR-11, FR-17, FR-18, FR-20 |
| ขึ้นกับ | BE-010, BE-011, BE-012, FE-001 |
| อ่านประกอบ | `Read24 (1).html` (หน้าตา back office) |

## งานที่ต้องทำ

### Admin: `/admin/dashboard` — แดชบอร์ดภาพรวม
- [ ] การ์ดสรุป: GMV, ส่วนแบ่ง Read24, ส่วนแบ่งสำนักพิมพ์ + % เทียบเดือนก่อน
- [ ] กราฟ bar chart: ยอดขายรายเดือน (แยก platform / publisher)
- [ ] Pie chart: สัดส่วน ซื้อ vs เช่า (จำนวน + มูลค่า)
- [ ] การ์ด: จำนวนเล่มแยกตาม status (published / pending_review / draft / suspended)
- [ ] ตาราง: รายการสั่งซื้อล่าสุด + audit log ล่าสุด
- [ ] Date range picker (from / to)

### Admin: `/admin/books` — จัดการหนังสือทั้งระบบ
- [ ] ตาราง + filter by status, publisher — (ขยายจาก FE-009)
- [ ] ปุ่ม publish / reject / suspend พร้อม confirmation dialog
- [ ] ตัวคำนวณส่วนแบ่งสด: ใส่ราคา → โชว์ publisher ได้ / Read24 ได้ (§3.2)

### Admin: `/admin/revenue` — ส่วนแบ่งรายได้
- [ ] สรุป: GMV → หักค่าธรรมเนียม → net → แบ่ง Read24 / สำนักพิมพ์
- [ ] ตารางแยกตามสำนักพิมพ์
- [ ] Date range filter
- [ ] ปุ่ม **Export CSV**

### Admin: `/admin/publishers` — จัดการสำนักพิมพ์
- [ ] รายชื่อสำนักพิมพ์ + revenue_share + bookCount + totalEarnings
- [ ] แก้ไข revenue_share ได้ (พร้อม confirm)

### Admin: `/admin/audit-logs` — บันทึกการกระทำ
- [ ] ตาราง: actor, action, target, note, เวลา — paginated
- [ ] Filter by action type

### Publisher: `/publisher/dashboard` — แดชบอร์ดของฉัน
- [ ] การ์ด: ยอดขายรวม, ส่วนแบ่งที่ได้, จำนวนเล่ม, จำนวนที่ขาย/เช่า
- [ ] กราฟรายได้รายเดือน (เฉพาะของฉัน)
- [ ] Top books by sales

### Publisher: `/publisher/books` — หนังสือของฉัน (ขยาย FE-008)
- [ ] แสดง rejection reason ชัดเจน + ปุ่ม "แก้ไขและส่งใหม่"
- [ ] ตัวคำนวณส่วนแบ่งสดในฟอร์ม (ใส่ราคา → โชว์ได้รับ 70%)

### Publisher: `/publisher/revenue` — รายได้ละเอียด
- [ ] รายละเอียดส่วนแบ่งต่อเล่ม + ช่วงเวลา
- [ ] ปุ่ม **Export CSV** (เฉพาะของตน)

## Security UX
- [ ] ไม่ส่ง publisher_id ใน request body — ใช้จาก token อัตโนมัติ
- [ ] Admin route guard: redirect ถ้า role ≠ admin
- [ ] Publisher route guard: redirect ถ้า role ≠ publisher

## Definition of Done
- [ ] Dashboard ตัวเลขตรงกับ BE API
- [ ] Export CSV ดาวน์โหลดได้ถูกต้อง
- [ ] Publisher เข้า `/admin/*` → redirect 403
- [ ] `tsc --noEmit` และ `lint` ผ่าน
