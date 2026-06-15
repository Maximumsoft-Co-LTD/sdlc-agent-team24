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
      <div style={{ backgroundColor: '#ECE3D2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: '0 22px' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#E0EFE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M8 16l5 5 11-11" stroke="#2F6E54" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: "'Trirong',serif", fontSize: 26, fontWeight: 700, color: '#2A241C', marginBottom: 10 }}>ซื้อสำเร็จ!</h2>
          <p style={{ fontSize: 15, color: '#4A4234', marginBottom: 28 }}>ได้รับหนังสือ {success.count} เล่ม เรียบร้อยแล้ว</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/library" style={{ padding: '11px 22px', borderRadius: 10, backgroundColor: '#BF5A2B', color: '#FBF6EC', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
              ชั้นหนังสือ
            </Link>
            <Link href="/books" style={{ padding: '11px 22px', borderRadius: 10, border: '1.5px solid #DDD1B8', color: '#4A4234', backgroundColor: '#FBF6EC', textDecoration: 'none', fontWeight: 500, fontSize: 15 }}>
              ซื้อเพิ่ม
            </Link>
          </div>
        </div>
      </div>
    )

  if (loading)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0', backgroundColor: '#ECE3D2', minHeight: '100vh' }}>
        <div style={{ width: 32, height: 32, border: '4px solid #BF5A2B', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )

  return (
    <div style={{ backgroundColor: '#ECE3D2', minHeight: '100vh' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 22px' }}>
        <h1 style={{ fontFamily: "'Trirong',serif", fontSize: 26, fontWeight: 700, color: '#2A241C', marginBottom: 24 }}>
          ตะกร้าสินค้า ({cart.count} เล่ม)
        </h1>

        {cart.items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>🛒</p>
            <p style={{ fontSize: 16, color: '#6B6253', marginBottom: 20 }}>ตะกร้าว่างเปล่า</p>
            <Link href="/books" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 10, backgroundColor: '#BF5A2B', color: '#FBF6EC', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
              ไปเลือกหนังสือ
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 26, alignItems: 'start' }}>
            {/* Left — cart items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cart.items.filter((item: any) => item.book).map((item: any) => (
                <div
                  key={item.cartItemId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '14px 16px',
                    borderRadius: 12,
                    backgroundColor: '#FBF6EC',
                    border: '1px solid #E0D5BE',
                    boxShadow: '0 1px 4px rgba(42,36,28,.06)',
                  }}
                >
                  {/* cover thumbnail */}
                  <div style={{ width: 64, aspectRatio: '2/3', borderRadius: 6, overflow: 'hidden', flexShrink: 0, backgroundColor: '#DDD1B8' }}>
                    {item.book.cover_url
                      ? <img src={item.book.cover_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      : <div style={{ width: '100%', height: '100%', background: '#C0BAA8' }} />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'Trirong',serif", fontSize: 16, fontWeight: 600, color: '#2A241C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.book.title}
                    </p>
                    <p style={{ fontSize: 13, color: '#6B6253', marginTop: 2 }}>{item.book.author}</p>
                    <span style={{ display: 'inline-block', marginTop: 6, fontSize: 11.5, fontWeight: 600, color: '#4A4234', backgroundColor: '#ECEAE2', borderRadius: 20, padding: '2px 8px' }}>ซื้อขาด</span>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: "'Trirong',serif", fontWeight: 700, fontSize: 17, color: '#2A241C' }}>
                      ฿{item.price || item.book.price_buy}
                    </p>
                    <button
                      onClick={() => removeItem(item.book._id)}
                      style={{ fontSize: 12.5, color: '#9A4632', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4, padding: 0, fontFamily: "'IBM Plex Sans Thai',system-ui,sans-serif" }}
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right — summary card (sticky) */}
            <div style={{ position: 'sticky', top: 90 }}>
              <div style={{ backgroundColor: '#FBF6EC', border: '1px solid #E0D5BE', borderRadius: 16, padding: '22px 20px', boxShadow: '0 2px 8px rgba(42,36,28,.08)' }}>
                <h3 style={{ fontFamily: "'Trirong',serif", fontSize: 18, fontWeight: 700, color: '#2A241C', marginBottom: 18 }}>สรุปคำสั่งซื้อ</h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6B6253', marginBottom: 8 }}>
                  <span>ยอดรวม</span>
                  <span>฿{cart.total?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6B6253', marginBottom: 16 }}>
                  <span>ค่าธรรมเนียม</span>
                  <span>฿0</span>
                </div>
                <div style={{ borderTop: '1px solid #E0D5BE', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#2A241C' }}>ยอดชำระ</span>
                  <span style={{ fontFamily: "'Trirong',serif", fontSize: 26, fontWeight: 700, color: '#BF5A2B' }}>฿{cart.total?.toLocaleString()}</span>
                </div>

                {/* Payment methods */}
                <p style={{ fontSize: 13, fontWeight: 600, color: '#4A4234', marginBottom: 10 }}>วิธีชำระ</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 12,
                      cursor: 'pointer',
                      border: paymentMethod === 'mock' ? '2px solid #BF5A2B' : '2px solid #E0D5BE',
                      backgroundColor: paymentMethod === 'mock' ? '#FBF1E2' : '#fff',
                    }}
                  >
                    <input type="radio" checked={paymentMethod === 'mock'} onChange={() => setPaymentMethod('mock')} style={{ accentColor: '#BF5A2B' }} />
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: '#2A241C' }}>PromptPay (จำลอง)</p>
                      <p style={{ fontSize: 12, color: '#6B6253' }}>ชำระผ่าน QR Code จำลอง</p>
                    </div>
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 12,
                      cursor: (user?.balance || 0) < (cart.total || 0) ? 'not-allowed' : 'pointer',
                      opacity: (user?.balance || 0) < (cart.total || 0) ? .5 : 1,
                      border: paymentMethod === 'coin' ? '2px solid #BF5A2B' : '2px solid #E0D5BE',
                      backgroundColor: paymentMethod === 'coin' ? '#FBF1E2' : '#fff',
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
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: '#2A241C' }}>🪙 เหรียญ ({(user?.balance || 0).toLocaleString()})</p>
                      <p style={{ fontSize: 12, color: '#6B6253' }}>
                        {(user?.balance || 0) >= (cart.total || 0) ? `หักเหรียญ ${cart.total?.toLocaleString()}` : 'เหรียญไม่เพียงพอ'}
                      </p>
                    </div>
                  </label>
                </div>

                {error && <p style={{ fontSize: 13, color: '#BF5A2B', marginBottom: 12 }}>{error}</p>}

                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  style={{
                    width: '100%',
                    height: 50,
                    borderRadius: 12,
                    backgroundColor: '#BF5A2B',
                    color: '#FBF6EC',
                    border: 'none',
                    fontFamily: "'Trirong',serif",
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 8px 18px -8px rgba(191,90,43,.60)',
                    opacity: checkoutLoading ? .6 : 1,
                  }}
                >
                  {checkoutLoading ? 'กำลังดำเนินการ...' : `ยืนยันชำระ ฿${cart.total?.toLocaleString()}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
