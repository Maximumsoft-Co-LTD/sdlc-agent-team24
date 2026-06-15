'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/books')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'LOGIN_FAILED'
      if (msg === 'INVALID_CREDENTIALS') setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      else setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
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
          <p style={{ fontSize: 13.5, color: 'rgba(243,233,210,.7)', marginTop: 4 }}>เข้าสู่ระบบเพื่อเริ่มอ่าน</p>
        </div>

        {/* Form area */}
        <div style={{ backgroundColor: '#fff', padding: '28px 32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                style={inputStyle}
                placeholder="••••••••"
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
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#6B6253', marginTop: 18 }}>
            ยังไม่มีบัญชี?{' '}
            <Link href="/register" style={{ fontWeight: 600, color: '#BF5A2B', textDecoration: 'none' }}>
              สมัครสมาชิก
            </Link>
          </p>

          {/* Demo accounts */}
          <div style={{ marginTop: 18, padding: '12px 14px', borderRadius: 10, backgroundColor: '#FBF9F2', border: '1px solid #E0D5BE', fontSize: 12.5, color: '#6B6253' }}>
            <p style={{ fontWeight: 600, color: '#4A4234', marginBottom: 6 }}>Demo accounts:</p>
            <p>reader@read24.com / Reader1234!</p>
            <p>publisher@read24.com / Pub1234!</p>
            <p>admin@read24.com / Admin1234!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
