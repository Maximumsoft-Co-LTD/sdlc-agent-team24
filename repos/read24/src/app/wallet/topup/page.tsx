'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface CoinPackage {
  _id: string
  coins: number
  bonus: number
  price_thb: number
}

function getBestValueId(packages: CoinPackage[]): string | null {
  if (!packages.length) return null
  return packages.reduce((best, pkg) =>
    pkg.bonus > best.bonus ? pkg : best
  )._id
}

export default function TopupPage() {
  const { user, accessToken, loading: authLoading, updateBalance } = useAuth()
  const [packages, setPackages] = useState<CoinPackage[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
    fetch('/api/v1/coin-packages')
      .then(r => r.json())
      .then(data => setPackages(data.items || []))
  }, [authLoading, user])

  const bestValueId = getBestValueId(packages)

  const handleTopup = async () => {
    if (!selected || !accessToken) return
    setLoading(true)
    const res = await fetch('/api/v1/wallet/topup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({ packageId: selected }),
    })
    const data = await res.json()
    if (res.ok) {
      updateBalance(data.balance)
      setSuccess(data)
    }
    setLoading(false)
  }

  if (success)
    return (
      <div style={{ backgroundColor: '#ECE3D2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: '0 22px' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: "'Trirong',serif", fontSize: 26, fontWeight: 700, color: '#2A241C', marginBottom: 12 }}>เติมเหรียญสำเร็จ!</h2>
          <p style={{ fontSize: 15, color: '#4A4234', marginBottom: 6 }}>
            ได้รับ <span style={{ fontWeight: 700, color: '#BF5A2B' }}>{success.coins}</span> เหรียญ
          </p>
          {success.bonus > 0 && (
            <p style={{ fontSize: 15, color: '#4A4234', marginBottom: 16 }}>
              + โบนัส <span style={{ fontWeight: 700, color: '#2F6E54' }}>{success.bonus}</span> เหรียญ
            </p>
          )}
          <p style={{ fontSize: 17, fontWeight: 600, color: '#2A241C', marginBottom: 28 }}>
            ยอดรวม: 🪙 {success.balance?.toLocaleString()}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/wallet')}
              style={{ padding: '12px 22px', borderRadius: 10, backgroundColor: '#BF5A2B', color: '#FBF6EC', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer', fontFamily: "'IBM Plex Sans Thai',system-ui,sans-serif" }}
            >
              ดูกระเป๋า
            </button>
            <button
              onClick={() => router.push('/books')}
              style={{ padding: '12px 22px', borderRadius: 10, border: '1.5px solid #DDD1B8', color: '#4A4234', backgroundColor: '#FBF6EC', fontWeight: 500, fontSize: 15, cursor: 'pointer', fontFamily: "'IBM Plex Sans Thai',system-ui,sans-serif" }}
            >
              ซื้อหนังสือ
            </button>
          </div>
        </div>
      </div>
    )

  return (
    <div style={{ backgroundColor: '#ECE3D2', minHeight: '100vh' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 22px' }}>
        <h1 style={{ fontFamily: "'Trirong',serif", fontSize: 26, fontWeight: 700, color: '#2A241C', marginBottom: 4 }}>
          เติมเหรียญ
        </h1>
        <p style={{ fontSize: 14, color: '#6B6253', marginBottom: 24 }}>
          ยอดปัจจุบัน: 🪙 {(user?.balance || 0).toLocaleString()} เหรียญ
        </p>

        {/* Packages grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 22 }}>
          {packages.map(pkg => {
            const isSelected = selected === pkg._id
            const isBest = pkg._id === bestValueId && pkg.bonus > 0
            return (
              <label
                key={pkg._id}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '16px 14px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  border: isBest
                    ? (isSelected ? '2px solid #BF5A2B' : '2px solid #BF5A2B')
                    : (isSelected ? '2px solid #BF5A2B' : '2px solid #DDD1B8'),
                  backgroundColor: isSelected ? '#FBF1E2' : '#fff',
                  transition: 'all .12s',
                }}
              >
                {isBest && (
                  <span style={{
                    position: 'absolute',
                    top: -10,
                    right: 10,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 30,
                    backgroundColor: '#BF5A2B',
                    color: '#FBF6EC',
                  }}>
                    คุ้มสุด!
                  </span>
                )}
                <input
                  type="radio"
                  name="package"
                  value={pkg._id}
                  checked={isSelected}
                  onChange={() => setSelected(pkg._id)}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                />
                <p style={{ fontFamily: "'Trirong',serif", fontWeight: 700, fontSize: 22, color: '#2A241C', marginBottom: 2 }}>
                  🪙 {pkg.coins.toLocaleString()}
                </p>
                {pkg.bonus > 0 && (
                  <p style={{ fontSize: 12.5, color: '#2F6E54', marginBottom: 8 }}>+ โบนัส {pkg.bonus}</p>
                )}
                <p style={{ fontFamily: "'Trirong',serif", fontSize: 20, fontWeight: 700, color: isSelected ? '#BF5A2B' : '#2A241C', marginTop: 'auto' }}>
                  ฿{pkg.price_thb}
                </p>
                {pkg.bonus > 0 && (
                  <span style={{ display: 'inline-block', marginTop: 6, fontSize: 11, padding: '2px 8px', borderRadius: 20, backgroundColor: 'rgba(47,110,84,.12)', color: '#2F6E54' }}>
                    ประหยัดกว่า!
                  </span>
                )}
              </label>
            )
          })}
        </div>

        {/* Demo notice */}
        <div style={{ padding: '14px 16px', borderRadius: 12, marginBottom: 20, backgroundColor: '#FBEFD6', border: '1px solid #E0B45C', fontSize: 13.5 }}>
          <p style={{ fontWeight: 600, color: '#7A5A16', marginBottom: 4 }}>Demo Mode</p>
          <p style={{ color: '#8A6A16' }}>การเติมเหรียญเป็นการจำลอง — ไม่มีการชำระเงินจริง</p>
        </div>

        <button
          onClick={handleTopup}
          disabled={!selected || loading}
          style={{
            width: '100%',
            height: 50,
            borderRadius: 12,
            backgroundColor: '#2A241C',
            color: '#FBF6EC',
            border: 'none',
            fontFamily: "'Trirong',serif",
            fontSize: 17,
            fontWeight: 600,
            cursor: !selected || loading ? 'not-allowed' : 'pointer',
            opacity: !selected || loading ? .5 : 1,
          }}
        >
          {loading
            ? 'กำลังเติมเหรียญ...'
            : selected
            ? `เติมเหรียญ ฿${packages.find(p => p._id === selected)?.price_thb}`
            : 'เลือกแพ็กเกจ'}
        </button>
      </div>
    </div>
  )
}
