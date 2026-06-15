# BE-001 — Authentication API

| Field | Value |
|-------|-------|
| สถานะ | open |
| Sprint | 1 |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec Full §5,6, FR-1, NFR-4 |
| ขึ้นกับ | DB-001 |
| บล็อก | BE-002~012, FE ทุกตัว |

## Endpoints

```
POST /api/v1/auth/register   { email, password, displayName } → 201
POST /api/v1/auth/login      { email, password }              → 200 + set refresh cookie
POST /api/v1/auth/refresh    (cookie)                         → 200 { accessToken }
GET  /api/v1/me                                               → โปรไฟล์ + role
```

## งานที่ต้องทำ

- [ ] Argon2id password hashing (NFR-4)
- [ ] Access token JWT อายุ 15 นาที
- [ ] Refresh token (httpOnly cookie) อายุ 30 วัน
- [ ] Middleware ตรวจ JWT ทุก protected route
- [ ] Role guard: reader / publisher / admin
- [ ] Rate limit login: ≤ 10 ครั้ง/นาที/IP (Redis)
- [ ] Rate limit content-url: ≤ 60 ครั้ง/นาที/user

## Definition of Done

- [ ] Register → Login → Refresh ครบ
- [ ] 401 เมื่อรหัสผ่านผิด
- [ ] Rate limiting ทำงาน
