'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'EMAIL_TAKEN') setError('อีเมลนี้ถูกใช้งานแล้ว')
        else if (data.error === 'PASSWORD_TOO_SHORT') setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
        else if (data.error === 'INVALID_EMAIL') setError('รูปแบบอีเมลไม่ถูกต้อง')
        else setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
        return
      }
      router.push('/login?registered=1')
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    backgroundColor: '#FBF9F2',
    border: '1.5px solid #DDD1B8',
    borderRadius: 10,
    padding: '11px 14px',
    fontSize: 14.5,
    color: '#2A241C',
    outline: 'none',
    fontFamily: "'IBM Plex Sans Thai',system-ui,sans-serif",
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECE3D2', padding: '22px' }}>
      <div style={{ width: '100%', maxWidth: 440, borderRadius: 16, overflow: 'hidden', border: '1px solid #E0D5BE', boxShadow: '0 4px 16px rgba(42,36,28,.10),0 1px 3px rgba(42,36,28,.08)' }}>
        {/* Forest gradient header strip */}
        <div style={{
          background: 'linear-gradient(135deg,#2F5D50,#264A40)',
          padding: '24px 32px',
          textAlign: 'center',
        }}>
          <h1 style={{ fontFamily: "'Trirong',serif", fontSize: 28, fontWeight: 700, color: '#F3E9D2', letterSpacing: '-0.01em' }}>
            Read24•
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(243,233,210,.7)', marginTop: 4 }}>สร้างบัญชีใหม่</p>
        </div>

        {/* Form area */}
        <div style={{ backgroundColor: '#fff', padding: '28px 32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13.5, fontWeight: 500, color: '#4A4234', marginBottom: 6 }}>
                ชื่อที่แสดง
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
                style={inputStyle}
                placeholder="ชื่อของคุณ"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13.5, fontWeight: 500, color: '#4A4234', marginBottom: 6 }}>
                อีเมล
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={inputStyle}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13.5, fontWeight: 500, color: '#4A4234', marginBottom: 6 }}>
                รหัสผ่าน
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                style={inputStyle}
                placeholder="อย่างน้อย 8 ตัวอักษร"
              />
            </div>
            {error && <p style={{ fontSize: 13.5, color: '#BF5A2B' }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px 0',
                borderRadius: 10,
                backgroundColor: '#BF5A2B',
                color: '#FBF6EC',
                border: 'none',
                fontFamily: "'IBM Plex Sans Thai',system-ui,sans-serif",
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? .6 : 1,
                marginTop: 4,
              }}
            >
              {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#6B6253', marginTop: 18 }}>
            มีบัญชีอยู่แล้ว?{' '}
            <Link href="/login" style={{ fontWeight: 600, color: '#BF5A2B', textDecoration: 'none' }}>
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
