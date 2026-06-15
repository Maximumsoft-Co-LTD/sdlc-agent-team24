# FE-001 — Authentication Pages

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 1 |
| ผู้รับผิดชอบ | Frontend Dev |
| อ้างอิง | FR-1 |
| ขึ้นกับ | BE-001 |

## งานที่ต้องทำ

- [ ] `/register` — ฟอร์ม email, password, displayName
- [ ] `/login` — ฟอร์ม email, password
- [ ] Access token เก็บใน memory (ไม่ใช้ localStorage)
- [ ] Refresh token เป็น httpOnly cookie (browser จัดการ) — ไม่ต้องทำ rotation สำหรับ demo
- [ ] (Optional สำหรับ demo) API interceptor: 401 → refresh → retry อัตโนมัติ
- [ ] Route guard: redirect → `/login` ถ้า unauthenticated
- [ ] Client-side validation + error message จาก API

## Definition of Done

- [ ] Register → Login → protected route ได้
- [ ] `tsc --noEmit` + `lint` ผ่าน
