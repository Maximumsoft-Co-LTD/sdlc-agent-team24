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

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#EFE6D2' }}
    >
      <div
        className="rounded-2xl shadow-lg w-full max-w-md overflow-hidden"
        style={{ border: '1px solid #DDD1B8' }}
      >
        {/* Header bar */}
        <div
          className="px-8 py-6 text-center"
          style={{ backgroundColor: '#2F5D50' }}
        >
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "'Trirong', serif", color: '#F3E9D2' }}
          >
            Read24
          </h1>
          <p className="text-sm mt-1" style={{ color: '#b3a88f' }}>สร้างบัญชีใหม่</p>
        </div>

        <div className="px-8 py-6" style={{ backgroundColor: '#FBF6EC' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#5a5142' }}>
                ชื่อที่แสดง
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{
                  border: '1.5px solid #DDD1B8',
                  backgroundColor: '#EFE6D2',
                  color: '#2A241C',
                }}
                placeholder="ชื่อของคุณ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#5a5142' }}>
                อีเมล
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{
                  border: '1.5px solid #DDD1B8',
                  backgroundColor: '#EFE6D2',
                  color: '#2A241C',
                }}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#5a5142' }}>
                รหัสผ่าน
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{
                  border: '1.5px solid #DDD1B8',
                  backgroundColor: '#EFE6D2',
                  color: '#2A241C',
                }}
                placeholder="อย่างน้อย 8 ตัวอักษร"
              />
            </div>
            {error && (
              <p className="text-sm" style={{ color: '#BF5A2B' }}>{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
            >
              {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <p className="text-center text-sm mt-4" style={{ color: '#6B6253' }}>
            มีบัญชีอยู่แล้ว?{' '}
            <Link href="/login" className="font-medium" style={{ color: '#BF5A2B' }}>
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
