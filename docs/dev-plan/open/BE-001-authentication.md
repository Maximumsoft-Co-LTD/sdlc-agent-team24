# BE-001 — Authentication API

| Field | Value |
|-------|-------|
| สถานะ | open |
| ผู้รับผิดชอบ | Backend Dev |
| อ้างอิง | DevSpec §5, §6, FR-1, NFR-4 |
| ขึ้นกับ | DB-001 |
| บล็อก | BE-002~007, FE ทุกตัว |

## Endpoints

```
POST /api/v1/auth/register   { email, password, displayName } → 201 { user, accessToken }
POST /api/v1/auth/login      { email, password }              → 200 { user, accessToken } + set refresh cookie
POST /api/v1/auth/refresh    (cookie)                         → 200 { accessToken }
```

## งานที่ต้องทำ

### Password & Token
- [ ] ตั้ง Argon2id สำหรับ hash รหัสผ่าน (NFR-4)
- [ ] Access token JWT อายุ 15 นาที
- [ ] Refresh token (httpOnly cookie) อายุ 30 วัน
- [ ] Middleware ตรวจ JWT ทุก protected route

### Rate Limiting
- [ ] Login ≤ 10 ครั้ง / นาที / IP
- [ ] Content-url ≤ 60 ครั้ง / นาที / user (ใช้ Redis)

### Role Guard
- [ ] `role=reader` — เข้าถึง user endpoints
- [ ] `role=admin` — เข้าถึง `/admin/*` เท่านั้น

### Error Codes
| HTTP | Code | เมื่อไหร่ |
|------|------|---------|
| 401 | INVALID_CREDENTIALS | รหัสผ่านผิด |
| 401 | TOKEN_EXPIRED | token หมดอายุ |

## Definition of Done

- [ ] Register → Login → Refresh flow ทำงานครบ
- [ ] Token expired → refresh อัตโนมัติ
- [ ] Rate limiting ทำงาน (ทดสอบด้วย Jest + supertest)
- [ ] รหัสผ่านไม่เก็บ plaintext ใน DB
