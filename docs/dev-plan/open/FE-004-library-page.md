# FE-004 — My Library Page (Frontend)

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | Frontend Dev |
| อ้างอิง | DevSpec §6, FR-10 |
| ขึ้นกับ | BE-004, FE-001 |

## งานที่ต้องทำ

### `/library` — ชั้นหนังสือของฉัน
- [ ] Tab หรือ section: **ที่ซื้อแล้ว** / **กำลังเช่า** / **เช่าหมดอายุ**
- [ ] แสดง cover, title, author ของแต่ละเล่ม
- [ ] เล่มที่เช่า → แสดง "เหลืออีก X วัน" (daysLeft)
- [ ] เล่มที่หมดอายุ → แสดง "เช่าหมดอายุแล้ว" + ปุ่ม "เช่าอีกครั้ง" หรือ "ซื้อขาด"
- [ ] ปุ่ม "อ่านต่อ" ทุกเล่มที่มีสิทธิ์ active → ไปหน้า reader
- [ ] Redirect login ถ้า unauthenticated

## Definition of Done

- [ ] หลังซื้อ/เช่า หนังสือโผล่ใน library ทันที
- [ ] daysLeft แสดงถูกต้อง
- [ ] เล่มหมดอายุโผล่ใน "expired" section
