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

// The "best value" package is the one with the highest bonus
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
      <div
        className="max-w-md mx-auto px-4 py-16 text-center"
        style={{ backgroundColor: '#EFE6D2', minHeight: '100vh' }}
      >
        <div className="text-5xl mb-4">&#127881;</div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
        >
          เติมเหรียญสำเร็จ!
        </h2>
        <p className="mb-1" style={{ color: '#5a5142' }}>
          ได้รับ <span className="font-bold" style={{ color: '#BF5A2B' }}>{success.coins}</span> เหรียญ
        </p>
        {success.bonus > 0 && (
          <p className="mb-4" style={{ color: '#5a5142' }}>
            + โบนัส <span className="font-bold" style={{ color: '#2F6E54' }}>{success.bonus}</span> เหรียญ
          </p>
        )}
        <p className="text-lg font-medium" style={{ color: '#2A241C' }}>
          ยอดรวม: &#x1FA99; {success.balance?.toLocaleString()}
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => router.push('/wallet')}
            className="px-6 py-2 rounded-xl font-medium"
            style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
          >
            ดูกระเป๋า
          </button>
          <button
            onClick={() => router.push('/books')}
            className="px-6 py-2 rounded-xl font-medium"
            style={{ border: '1.5px solid #DDD1B8', color: '#5a5142', backgroundColor: '#FBF6EC' }}
          >
            ซื้อหนังสือ
          </button>
        </div>
      </div>
    )

  return (
    <div style={{ backgroundColor: '#EFE6D2', minHeight: '100vh' }}>
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
        >
          เติมเหรียญ
        </h1>
        <p className="text-sm mb-6" style={{ color: '#6B6253' }}>
          ยอดปัจจุบัน: &#x1FA99; {(user?.balance || 0).toLocaleString()} เหรียญ
        </p>

        <div className="grid grid-cols-1 gap-3 mb-6">
          {packages.map(pkg => {
            const isSelected = selected === pkg._id
            const isBest = pkg._id === bestValueId && pkg.bonus > 0
            return (
              <label
                key={pkg._id}
                className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors relative"
                style={{
                  border: isSelected ? '2px solid #BF5A2B' : '2px solid #DDD1B8',
                  backgroundColor: isSelected ? '#FBF1E2' : '#FBF6EC',
                }}
              >
                {isBest && (
                  <span
                    className="absolute -top-2.5 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
                  >
                    คุ้มสุด!
                  </span>
                )}
                <input
                  type="radio"
                  name="package"
                  value={pkg._id}
                  checked={isSelected}
                  onChange={() => setSelected(pkg._id)}
                  className="sr-only"
                />
                <div>
                  <p className="font-bold text-lg" style={{ color: '#2A241C' }}>
                    &#x1FA99; {pkg.coins.toLocaleString()} เหรียญ
                  </p>
                  {pkg.bonus > 0 && (
                    <p className="text-sm" style={{ color: '#2F6E54' }}>
                      + โบนัส {pkg.bonus} เหรียญ
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold" style={{ color: '#2A241C' }}>฿{pkg.price_thb}</p>
                  {pkg.bonus > 0 && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(47,110,84,0.12)', color: '#2F6E54' }}
                    >
                      ประหยัดกว่า!
                    </span>
                  )}
                </div>
              </label>
            )
          })}
        </div>

        {/* Demo notice */}
        <div
          className="p-4 rounded-xl mb-6 text-sm"
          style={{ backgroundColor: 'rgba(201,154,63,0.12)', border: '1px solid #E0B45C' }}
        >
          <p className="font-medium mb-1" style={{ color: '#8a6a16' }}>Demo Mode</p>
          <p style={{ color: '#8a6a16' }}>การเติมเหรียญเป็นการจำลอง — ไม่มีการชำระเงินจริง</p>
        </div>

        <button
          onClick={handleTopup}
          disabled={!selected || loading}
          className="w-full py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
          style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
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
