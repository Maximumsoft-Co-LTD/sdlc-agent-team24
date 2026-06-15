# FE-001 — Authentication Pages (Frontend)

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | Frontend Dev |
| อ้างอิง | DevSpec §5, §6, FR-1 |
| ขึ้นกับ | BE-001, INFRA-001 |

## งานที่ต้องทำ

### Pages
- [ ] `/register` — ฟอร์มสมัครสมาชิก (email, password, displayName)
- [ ] `/login` — ฟอร์มเข้าสู่ระบบ (email, password)

### Token Management
- [ ] เก็บ access token ใน memory (ไม่ใส่ localStorage)
- [ ] Refresh token อยู่ใน httpOnly cookie (จัดการ browser ให้อัตโนมัติ)
- [ ] API interceptor: ถ้า 401 → เรียก `/auth/refresh` แล้ว retry อัตโนมัติ
- [ ] Logout: clear token + redirect ไป `/login`

### Validation (client-side)
- [ ] Email format
- [ ] Password ≥ 8 ตัวอักษร
- [ ] แสดง error message จาก API (INVALID_CREDENTIALS, ฯลฯ)

### Route Protection
- [ ] Middleware/HOC: redirect ไป `/login` ถ้า unauthenticated
- [ ] Redirect ไปหน้าที่ต้องการหลัง login สำเร็จ

## Definition of Done

- [ ] Register → Login → ได้ token → เข้าหน้า protected ได้
- [ ] Token expired → refresh อัตโนมัติ ไม่ต้อง login ใหม่
- [ ] ผิดรหัส → error message ชัดเจน
- [ ] `tsc --noEmit` และ `lint` ผ่าน
