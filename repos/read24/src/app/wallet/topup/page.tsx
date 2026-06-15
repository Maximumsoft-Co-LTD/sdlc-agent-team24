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
      .then(setPackages)
  }, [authLoading, user])

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
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">เติมเหรียญสำเร็จ!</h2>
        <p className="text-gray-600 mb-1">
          ได้รับ <span className="font-bold text-indigo-600">{success.coins}</span> เหรียญ
        </p>
        {success.bonus > 0 && (
          <p className="text-gray-600 mb-4">
            + โบนัส <span className="font-bold text-green-600">{success.bonus}</span> เหรียญ
          </p>
        )}
        <p className="text-lg font-medium">ยอดรวม: 🪙 {success.balance?.toLocaleString()}</p>
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => router.push('/wallet')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl"
          >
            ดูกระเป๋า
          </button>
          <button
            onClick={() => router.push('/books')}
            className="border border-gray-300 px-6 py-2 rounded-xl"
          >
            ซื้อหนังสือ
          </button>
        </div>
      </div>
    )

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">เติมเหรียญ</h1>
      <p className="text-gray-500 text-sm mb-6">
        ยอดปัจจุบัน: 🪙 {(user?.balance || 0).toLocaleString()} เหรียญ
      </p>

      <div className="grid grid-cols-1 gap-3 mb-6">
        {packages.map(pkg => (
          <label
            key={pkg._id}
            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${
              selected === pkg._id
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="package"
              value={pkg._id}
              checked={selected === pkg._id}
              onChange={() => setSelected(pkg._id)}
              className="sr-only"
            />
            <div>
              <p className="font-bold text-lg">🪙 {pkg.coins.toLocaleString()} เหรียญ</p>
              {pkg.bonus > 0 && (
                <p className="text-green-600 text-sm">+ โบนัส {pkg.bonus} เหรียญ</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">฿{pkg.price_thb}</p>
              {pkg.bonus > 0 && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  ประหยัดกว่า!
                </span>
              )}
            </div>
          </label>
        ))}
      </div>

      <div className="p-4 bg-yellow-50 rounded-xl mb-6 text-sm text-yellow-800">
        <p className="font-medium">🎮 Demo Mode</p>
        <p>การเติมเหรียญเป็นการจำลอง — ไม่มีการชำระเงินจริง</p>
      </div>

      <button
        onClick={handleTopup}
        disabled={!selected || loading}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading
          ? 'กำลังเติมเหรียญ...'
          : selected
          ? `เติมเหรียญ ฿${packages.find(p => p._id === selected)?.price_thb}`
          : 'เลือกแพ็กเกจ'}
      </button>
    </div>
  )
}
