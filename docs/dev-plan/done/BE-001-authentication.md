# BE-001 — Authentication API

| Field | Value |
|-------|-------|
| สถานะ | done |
| Sprint | 1 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §5,6, FR-1, NFR-4 |
| ขึ้นกับ | DB-001 |
| บล็อก | BE-002~012, FE ทุกตัว |

## Endpoints

```
POST /api/v1/auth/register   { email, password, displayName } → 201   (Next.js Route Handler)
POST /api/v1/auth/login      { email, password }              → 200 + set refresh cookie
POST /api/v1/auth/refresh    (cookie)                         → 200 { accessToken }
GET  /api/v1/me                                               → โปรไฟล์ + role
```

## งานที่ต้องทำ

- [x] Argon2id password hashing (NFR-4)
- [x] Access token JWT อายุ 15 นาที
- [x] Refresh token (httpOnly cookie) — แบบง่าย, ไม่ต้อง rotation (optional สำหรับ demo)
- [x] Middleware ตรวจ JWT ทุก protected route
- [x] Role guard: reader / publisher / admin

## Definition of Done

- [x] Register → Login → Refresh ครบ
- [x] 401 เมื่อรหัสผ่านผิด
