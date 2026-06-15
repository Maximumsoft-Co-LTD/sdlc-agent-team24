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
          <p className="text-sm mt-1" style={{ color: '#b3a88f' }}>เข้าสู่ระบบเพื่อเริ่มอ่าน</p>
        </div>

        <div className="px-8 py-6" style={{ backgroundColor: '#FBF6EC' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{
                  border: '1.5px solid #DDD1B8',
                  backgroundColor: '#EFE6D2',
                  color: '#2A241C',
                }}
                placeholder="••••••••"
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
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <p className="text-center text-sm mt-4" style={{ color: '#6B6253' }}>
            ยังไม่มีบัญชี?{' '}
            <Link href="/register" className="font-medium" style={{ color: '#BF5A2B' }}>
              สมัครสมาชิก
            </Link>
          </p>

          {/* Demo accounts */}
          <div
            className="mt-4 p-3 rounded-lg text-xs"
            style={{ backgroundColor: '#EFE6D2', color: '#6B6253' }}
          >
            <p className="font-medium mb-1" style={{ color: '#5a5142' }}>Demo accounts:</p>
            <p>reader@read24.com / Reader1234!</p>
            <p>publisher@read24.com / Pub1234!</p>
            <p>admin@read24.com / Admin1234!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
