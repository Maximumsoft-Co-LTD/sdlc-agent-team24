'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function CartPage() {
  const { user, accessToken, loading: authLoading, updateBalance } = useAuth()
  const [cart, setCart] = useState<any>({ items: [], total: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<'mock' | 'coin'>('mock')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [authLoading, user])

  const fetchCart = async () => {
    if (!accessToken) return
    const res = await fetch('/api/v1/cart', {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
    })
    if (res.ok) setCart(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    if (accessToken) fetchCart()
  }, [accessToken])

  const removeItem = async (bookId: string) => {
    await fetch(`/api/v1/cart/items/${bookId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
    })
    fetchCart()
  }

  const handleCheckout = async () => {
    setError('')
    setCheckoutLoading(true)
    const res = await fetch('/api/v1/cart/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({ paymentMethod }),
    })
    const data = await res.json()
    if (res.ok) {
      if (paymentMethod === 'coin') updateBalance((user?.balance || 0) - cart.total)
      setSuccess(data)
    } else {
      if (data.error === 'INSUFFICIENT_COINS') setError('เหรียญไม่เพียงพอ กรุณาเติมเหรียญก่อน')
      else if (data.error === 'CART_EMPTY') setError('ตะกร้าว่างเปล่า')
      else setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
    setCheckoutLoading(false)
  }

  if (success)
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">ซื้อสำเร็จ!</h2>
        <p className="text-gray-600 mb-6">ได้รับหนังสือ {success.count} เล่ม เรียบร้อยแล้ว</p>
        <div className="flex gap-3 justify-center">
          <Link href="/library" className="bg-indigo-600 text-white px-6 py-2 rounded-xl">
            ชั้นหนังสือ
          </Link>
          <Link href="/books" className="border border-gray-300 px-6 py-2 rounded-xl">
            ซื้อเพิ่ม
          </Link>
        </div>
      </div>
    )

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">ตะกร้าสินค้า ({cart.count} เล่ม)</h1>

      {cart.items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🛒</p>
          <p className="text-gray-500 mb-4">ตะกร้าว่างเปล่า</p>
          <Link href="/books" className="text-indigo-600 hover:underline">
            เลือกซื้อหนังสือ
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {cart.items.map((item: any) => (
              <div
                key={item.cartItemId}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                <div
                  className="w-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex-shrink-0 overflow-hidden"
                  style={{ height: '72px' }}
                >
                  {item.book.cover_url && (
                    <img src={item.book.cover_url} className="w-full h-full object-cover" alt="" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.book.title}</p>
                  <p className="text-sm text-gray-500">{item.book.author}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">฿{item.price || item.book.price_buy}</p>
                  <button
                    onClick={() => removeItem(item.book._id)}
                    className="text-xs text-red-500 hover:text-red-700 mt-1"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex justify-between font-bold text-lg">
              <span>รวมทั้งหมด</span>
              <span>฿{cart.total?.toLocaleString()}</span>
            </div>
          </div>

          <div className="mb-4">
            <p className="font-medium mb-2">วิธีชำระ</p>
            <div className="space-y-2">
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer ${
                  paymentMethod === 'mock'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  checked={paymentMethod === 'mock'}
                  onChange={() => setPaymentMethod('mock')}
                />
                <div>
                  <p className="font-medium text-sm">PromptPay (จำลอง)</p>
                  <p className="text-xs text-gray-500">ชำระผ่าน QR Code จำลอง</p>
                </div>
              </label>
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer ${
                  (user?.balance || 0) < (cart.total || 0)
                    ? 'opacity-50 cursor-not-allowed'
                    : paymentMethod === 'coin'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  disabled={(user?.balance || 0) < (cart.total || 0)}
                  checked={paymentMethod === 'coin'}
                  onChange={() => setPaymentMethod('coin')}
                />
                <div>
                  <p className="font-medium text-sm">
                    🪙 เหรียญ ({(user?.balance || 0).toLocaleString()} เหรียญ)
                  </p>
                  <p className="text-xs text-gray-500">
                    {(user?.balance || 0) >= (cart.total || 0)
                      ? `หักเหรียญ ${cart.total?.toLocaleString()}`
                      : 'เหรียญไม่เพียงพอ'}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {checkoutLoading
              ? 'กำลังดำเนินการ...'
              : `ยืนยันชำระ ฿${cart.total?.toLocaleString()}`}
          </button>
        </>
      )}
    </div>
  )
}
