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
      <div
        className="max-w-md mx-auto px-4 py-16 text-center"
        style={{ backgroundColor: '#EFE6D2', minHeight: '100vh' }}
      >
        <div className="text-5xl mb-4">&#127881;</div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
        >
          ซื้อสำเร็จ!
        </h2>
        <p className="mb-6" style={{ color: '#5a5142' }}>
          ได้รับหนังสือ {success.count} เล่ม เรียบร้อยแล้ว
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/library"
            className="px-6 py-2 rounded-xl font-medium"
            style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
          >
            ชั้นหนังสือ
          </Link>
          <Link
            href="/books"
            className="px-6 py-2 rounded-xl font-medium"
            style={{ border: '1.5px solid #DDD1B8', color: '#5a5142', backgroundColor: '#FBF6EC' }}
          >
            ซื้อเพิ่ม
          </Link>
        </div>
      </div>
    )

  if (loading)
    return (
      <div className="flex justify-center py-16" style={{ backgroundColor: '#EFE6D2', minHeight: '100vh' }}>
        <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: '#BF5A2B', borderTopColor: 'transparent' }} />
      </div>
    )

  return (
    <div style={{ backgroundColor: '#EFE6D2', minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1
          className="text-2xl font-bold mb-6"
          style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
        >
          ตะกร้าสินค้า ({cart.count} เล่ม)
        </h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">&#128722;</p>
            <p className="mb-4" style={{ color: '#6B6253' }}>ตะกร้าว่างเปล่า</p>
            <Link href="/books" className="font-medium" style={{ color: '#BF5A2B' }}>
              เลือกซื้อหนังสือ
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {cart.items.map((item: any) => (
                <div
                  key={item.cartItemId}
                  className="flex items-center gap-4 p-4 rounded-xl"
                  style={{
                    backgroundColor: '#FBF6EC',
                    border: '1px solid #DDD1B8',
                    boxShadow: '0 1px 4px rgba(42,36,28,0.06)',
                  }}
                >
                  <div
                    className="w-14 rounded-lg flex-shrink-0 overflow-hidden"
                    style={{ height: '72px', backgroundColor: '#3D5A4A' }}
                  >
                    {item.book.cover_url && (
                      <img src={item.book.cover_url} className="w-full h-full object-cover" alt="" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: '#2A241C' }}>
                      {item.book.title}
                    </p>
                    <p className="text-sm" style={{ color: '#6B6253' }}>{item.book.author}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: '#2A241C' }}>
                      ฿{item.price || item.book.price_buy}
                    </p>
                    <button
                      onClick={() => removeItem(item.book._id)}
                      className="text-xs mt-1 transition-colors"
                      style={{ color: '#9a4632' }}
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div
              className="rounded-xl p-4 mb-4"
              style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}
            >
              <div className="flex justify-between font-bold text-lg">
                <span style={{ color: '#2A241C' }}>รวมทั้งหมด</span>
                <span style={{ color: '#2A241C' }}>฿{cart.total?.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="mb-4">
              <p className="font-medium mb-2" style={{ color: '#5a5142' }}>วิธีชำระ</p>
              <div className="space-y-2">
                <label
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                  style={{
                    border: paymentMethod === 'mock' ? '2px solid #BF5A2B' : '2px solid #DDD1B8',
                    backgroundColor: paymentMethod === 'mock' ? '#FBF1E2' : '#FBF6EC',
                  }}
                >
                  <input
                    type="radio"
                    checked={paymentMethod === 'mock'}
                    onChange={() => setPaymentMethod('mock')}
                    style={{ accentColor: '#BF5A2B' }}
                  />
                  <div>
                    <p className="font-medium text-sm" style={{ color: '#2A241C' }}>PromptPay (จำลอง)</p>
                    <p className="text-xs" style={{ color: '#6B6253' }}>ชำระผ่าน QR Code จำลอง</p>
                  </div>
                </label>
                <label
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${(user?.balance || 0) < (cart.total || 0) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{
                    border: paymentMethod === 'coin' ? '2px solid #BF5A2B' : '2px solid #DDD1B8',
                    backgroundColor: paymentMethod === 'coin' ? '#FBF1E2' : '#FBF6EC',
                  }}
                >
                  <input
                    type="radio"
                    disabled={(user?.balance || 0) < (cart.total || 0)}
                    checked={paymentMethod === 'coin'}
                    onChange={() => setPaymentMethod('coin')}
                    style={{ accentColor: '#BF5A2B' }}
                  />
                  <div>
                    <p className="font-medium text-sm" style={{ color: '#2A241C' }}>
                      &#x1FA99; เหรียญ ({(user?.balance || 0).toLocaleString()} เหรียญ)
                    </p>
                    <p className="text-xs" style={{ color: '#6B6253' }}>
                      {(user?.balance || 0) >= (cart.total || 0)
                        ? `หักเหรียญ ${cart.total?.toLocaleString()}`
                        : 'เหรียญไม่เพียงพอ'}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {error && <p className="text-sm mb-3" style={{ color: '#BF5A2B' }}>{error}</p>}

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
            >
              {checkoutLoading
                ? 'กำลังดำเนินการ...'
                : `ยืนยันชำระ ฿${cart.total?.toLocaleString()}`}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
