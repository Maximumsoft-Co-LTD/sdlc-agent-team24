'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface Props {
  book: {
    _id: string
    title: string
    author: string
    cover_url?: string | null
    price_buy: number
    price_rent?: number | null
    rent_days?: number | null
  }
  type: 'buy' | 'rent'
  onClose: () => void
  onSuccess: () => void
}

export default function PurchaseModal({ book, type, onClose, onSuccess }: Props) {
  const [paymentMethod, setPaymentMethod] = useState<'mock' | 'coin'>('mock')
  const [step, setStep] = useState<'choose' | 'confirm' | 'processing' | 'success'>('choose')
  const [error, setError] = useState('')
  const { user, accessToken, updateBalance } = useAuth()
  const router = useRouter()

  const price = type === 'buy' ? book.price_buy : (book.price_rent ?? 0)
  const canPayWithCoins = user && user.balance >= price

  const handleConfirm = async () => {
    setStep('processing')
    setError('')
    try {
      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        credentials: 'include',
        body: JSON.stringify({ bookId: book._id, type, paymentMethod }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'DUPLICATE_ENTITLEMENT') setError('คุณมีหนังสือเล่มนี้อยู่แล้ว')
        else if (data.error === 'INSUFFICIENT_COINS') setError('เหรียญไม่เพียงพอ')
        else if (data.error === 'RENT_NOT_AVAILABLE') setError('หนังสือนี้ไม่มีตัวเลือกเช่า')
        else setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
        setStep('choose')
        return
      }
      if (paymentMethod === 'coin') updateBalance((user?.balance ?? 0) - price)
      setStep('success')
      onSuccess()
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
      setStep('choose')
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
      <div className="rounded-2xl p-6 w-full max-w-sm shadow-xl" style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}>
        {step === 'success' ? (
          <div className="text-center">
            <div className="text-5xl mb-4">&#10003;</div>
            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}>
              {type === 'buy' ? 'ซื้อสำเร็จ!' : 'เช่าสำเร็จ!'}
            </h2>
            <p className="mb-6" style={{ color: '#5a5142' }}>{book.title}</p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/library')}
                className="flex-1 py-2.5 rounded-xl font-medium"
                style={{ backgroundColor: '#2F5D50', color: '#EFE6D2' }}
              >
                ชั้นหนังสือ
              </button>
              <button
                onClick={() => router.push(`/read/${book._id}`)}
                className="flex-1 py-2.5 rounded-xl font-medium"
                style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
              >
                อ่านเลย
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
              >
                {type === 'buy' ? 'ซื้อหนังสือ' : 'เช่าหนังสือ'}
              </h2>
              <button
                onClick={onClose}
                className="text-2xl leading-none transition-colors"
                style={{ color: '#b3a88f' }}
              >
                &times;
              </button>
            </div>

            {/* Book summary */}
            <div className="flex gap-3 mb-4 p-3 rounded-xl" style={{ backgroundColor: '#EFE6D2' }}>
              <div
                className="w-16 h-20 rounded-lg flex-shrink-0 overflow-hidden"
                style={{ backgroundColor: '#3D5A4A' }}
              >
                {book.cover_url && (
                  <img src={book.cover_url} className="w-full h-full object-cover" alt="" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm" style={{ color: '#2A241C' }}>{book.title}</p>
                <p className="text-xs" style={{ color: '#6B6253' }}>{book.author}</p>
                <p className="text-lg font-bold mt-1" style={{ color: '#2A241C' }}>฿{price}</p>
                {type === 'rent' && (
                  <p className="text-xs" style={{ color: '#6B6253' }}>{book.rent_days ?? 7} วัน</p>
                )}
              </div>
            </div>

            {/* Payment method */}
            <div className="mb-4">
              <p className="text-sm font-medium mb-2" style={{ color: '#5a5142' }}>วิธีชำระ</p>
              <div className="space-y-2">
                {/* PromptPay */}
                <label
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                  style={{
                    border: paymentMethod === 'mock' ? '2px solid #BF5A2B' : '2px solid #DDD1B8',
                    backgroundColor: paymentMethod === 'mock' ? '#FBF1E2' : '#FBF6EC',
                  }}
                >
                  <input
                    type="radio"
                    value="mock"
                    checked={paymentMethod === 'mock'}
                    onChange={() => setPaymentMethod('mock')}
                    style={{ accentColor: '#BF5A2B' }}
                  />
                  <div>
                    <p className="font-medium text-sm" style={{ color: '#2A241C' }}>PromptPay (จำลอง)</p>
                    <p className="text-xs" style={{ color: '#6B6253' }}>ชำระผ่าน QR Code จำลอง</p>
                  </div>
                </label>

                {/* Coin */}
                <label
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${!canPayWithCoins ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{
                    border: paymentMethod === 'coin' ? '2px solid #BF5A2B' : '2px solid #DDD1B8',
                    backgroundColor: paymentMethod === 'coin' ? '#FBF1E2' : '#FBF6EC',
                  }}
                >
                  <input
                    type="radio"
                    value="coin"
                    disabled={!canPayWithCoins}
                    checked={paymentMethod === 'coin'}
                    onChange={() => setPaymentMethod('coin')}
                    style={{ accentColor: '#BF5A2B' }}
                  />
                  <div>
                    <p className="font-medium text-sm" style={{ color: '#2A241C' }}>
                      &#x1FA99; เหรียญ ({user?.balance ?? 0} เหรียญ)
                    </p>
                    <p className="text-xs" style={{ color: '#6B6253' }}>
                      {canPayWithCoins ? `หักเหรียญ ${price} เหรียญ` : 'เหรียญไม่เพียงพอ'}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* QR mockup */}
            {paymentMethod === 'mock' && (
              <div
                className="mb-4 p-4 rounded-xl text-center"
                style={{ backgroundColor: '#EFE6D2' }}
              >
                <p className="text-sm mb-2" style={{ color: '#6B6253' }}>QR Code จำลอง (Demo)</p>
                <div
                  className="w-32 h-32 rounded-lg mx-auto flex items-center justify-center"
                  style={{ backgroundColor: '#DDD1B8' }}
                >
                  <span className="text-xs text-center" style={{ color: '#5a5142' }}>
                    QR Code<br />PromptPay<br />(จำลอง)
                  </span>
                </div>
                <p className="text-sm font-medium mt-2" style={{ color: '#2A241C' }}>฿{price}</p>
              </div>
            )}

            {error && <p className="text-sm mb-3" style={{ color: '#BF5A2B' }}>{error}</p>}

            <button
              onClick={handleConfirm}
              disabled={step === 'processing'}
              className="w-full py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
            >
              {step === 'processing'
                ? 'กำลังดำเนินการ...'
                : `ยืนยัน${type === 'buy' ? 'ซื้อ' : 'เช่า'} ฿${price}`}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
