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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        {step === 'success' ? (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {type === 'buy' ? 'ซื้อสำเร็จ!' : 'เช่าสำเร็จ!'}
            </h2>
            <p className="text-gray-600 mb-6">{book.title}</p>
            <div className="flex gap-3">
              <button onClick={() => router.push('/library')} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-medium">ชั้นหนังสือ</button>
              <button onClick={() => router.push(`/read/${book._id}`)} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-medium">อ่านเลย</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{type === 'buy' ? 'ซื้อหนังสือ' : 'เช่าหนังสือ'}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <div className="flex gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
              <div className="w-16 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex-shrink-0 overflow-hidden">
                {book.cover_url && <img src={book.cover_url} className="w-full h-full object-cover" alt="" />}
              </div>
              <div>
                <p className="font-medium text-sm">{book.title}</p>
                <p className="text-xs text-gray-500">{book.author}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">฿{price}</p>
                {type === 'rent' && <p className="text-xs text-gray-500">{book.rent_days ?? 7} วัน</p>}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">วิธีชำระ</p>
              <div className="space-y-2">
                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer ${paymentMethod === 'mock' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}>
                  <input type="radio" value="mock" checked={paymentMethod === 'mock'} onChange={() => setPaymentMethod('mock')} />
                  <div>
                    <p className="font-medium text-sm">PromptPay (จำลอง)</p>
                    <p className="text-xs text-gray-500">ชำระผ่าน QR Code จำลอง</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer ${!canPayWithCoins ? 'opacity-50 cursor-not-allowed' : paymentMethod === 'coin' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}>
                  <input type="radio" value="coin" disabled={!canPayWithCoins} checked={paymentMethod === 'coin'} onChange={() => setPaymentMethod('coin')} />
                  <div>
                    <p className="font-medium text-sm">🪙 เหรียญ ({user?.balance ?? 0} เหรียญ)</p>
                    <p className="text-xs text-gray-500">{canPayWithCoins ? `หักเหรียญ ${price} เหรียญ` : 'เหรียญไม่เพียงพอ'}</p>
                  </div>
                </label>
              </div>
            </div>

            {paymentMethod === 'mock' && (
              <div className="mb-4 p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-sm text-gray-500 mb-2">QR Code จำลอง (Demo)</p>
                <div className="w-32 h-32 bg-gray-300 rounded-lg mx-auto flex items-center justify-center">
                  <span className="text-gray-600 text-xs text-center">QR Code<br />PromptPay<br />(จำลอง)</span>
                </div>
                <p className="text-sm font-medium mt-2">฿{price}</p>
              </div>
            )}

            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

            <button onClick={handleConfirm} disabled={step === 'processing'}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50">
              {step === 'processing' ? 'กำลังดำเนินการ...' : `ยืนยัน${type === 'buy' ? 'ซื้อ' : 'เช่า'} ฿${price}`}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
