'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PurchaseModal from '@/components/PurchaseModal'

interface Book {
  _id: string
  title: string
  author: string
  description: string
  category: string
  cover_url: string | null
  price_buy: number
  price_rent: number | null
  rent_days: number | null
  status: string
}

export default function BookDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchaseType, setPurchaseType] = useState<'buy' | 'rent'>('buy')
  const [owned, setOwned] = useState(false)
  const { user, accessToken } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/v1/books/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) router.push('/books')
        else setBook(data)
        setLoading(false)
      })
      .catch(() => { router.push('/books') })
  }, [id, router])

  useEffect(() => {
    if (user && accessToken) {
      fetch('/api/v1/me/library', { headers: { Authorization: `Bearer ${accessToken}` } })
        .then(r => r.json())
        .then(data => {
          const owned = data.owned || []
          const renting = data.renting || []
          const allBooks = [...owned, ...renting]
          setOwned(allBooks.some((e: { book: { _id: string } }) => e.book._id === id))
        })
        .catch(() => {})
    }
  }, [user, accessToken, id])

  const handleAddToCart = async () => {
    if (!user) { router.push('/login'); return }
    const res = await fetch('/api/v1/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ bookId: id }),
      credentials: 'include',
    })
    const data = await res.json()
    if (res.ok) alert('เพิ่มในตะกร้าแล้ว!')
    else if (data.error === 'DUPLICATE') alert('หนังสือนี้อยู่ในตะกร้าแล้ว')
    else alert('เกิดข้อผิดพลาด')
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#EFE6D2' }}>
      <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: '#BF5A2B', borderTopColor: 'transparent' }}></div>
    </div>
  )
  if (!book) return null

  return (
    <div style={{ backgroundColor: '#EFE6D2', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-[280px_1fr] gap-8">
          {/* Cover */}
          <div>
            <div
              className="rounded-xl overflow-hidden shadow-lg aspect-[2/3]"
              style={{ backgroundColor: '#3D5A4A' }}
            >
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-6 text-center">
                  <span style={{ fontFamily: "'Trirong', serif", color: '#EFE6D2', fontWeight: 600 }}>
                    {book.title}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <span
              className="text-xs font-medium px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(47,93,80,0.15)', color: '#2F5D50' }}
            >
              {book.category}
            </span>
            <h1
              className="text-2xl font-bold mt-3"
              style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
            >
              {book.title}
            </h1>
            <p className="mt-1" style={{ color: '#6B6253' }}>โดย {book.author}</p>
            <p className="mt-4 leading-relaxed text-sm" style={{ color: '#5a5142' }}>
              {book.description}
            </p>

            {/* Price box */}
            <div
              className="mt-6 p-4 rounded-xl"
              style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold" style={{ color: '#2A241C' }}>฿{book.price_buy}</span>
                <span className="text-sm" style={{ color: '#6B6253' }}>ซื้อขาด</span>
              </div>
              {book.price_rent && (
                <p className="text-sm" style={{ color: '#5a5142' }}>
                  เช่า ฿{book.price_rent} / {book.rent_days ?? 7} วัน
                </p>
              )}
            </div>

            {owned ? (
              <button
                onClick={() => router.push(`/read/${id}`)}
                className="mt-4 w-full py-3 rounded-xl font-medium transition-colors"
                style={{ backgroundColor: '#2F6E54', color: '#EFE6D2' }}
              >
                อ่านเลย
              </button>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {/* Buy option card */}
                <button
                  onClick={() => { setPurchaseType('buy'); setShowPurchaseModal(true) }}
                  className="w-full py-3 rounded-xl font-medium transition-colors text-left px-4"
                  style={{ backgroundColor: '#2A241C', color: '#EFE6D2' }}
                >
                  <span className="block text-sm font-semibold">ซื้อขาด</span>
                  <span className="text-lg font-bold">฿{book.price_buy}</span>
                </button>
                {book.price_rent && (
                  /* Rent option card */
                  <button
                    onClick={() => { setPurchaseType('rent'); setShowPurchaseModal(true) }}
                    className="w-full py-3 rounded-xl font-medium transition-colors text-left px-4"
                    style={{
                      backgroundColor: '#FBEFE3',
                      border: '2px solid #BF5A2B',
                      color: '#2A241C',
                    }}
                  >
                    <span className="block text-sm font-semibold" style={{ color: '#BF5A2B' }}>เช่า {book.rent_days ?? 7} วัน</span>
                    <span className="text-lg font-bold">฿{book.price_rent}</span>
                  </button>
                )}
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3 rounded-xl font-medium transition-colors"
                  style={{
                    backgroundColor: '#FBF6EC',
                    border: '1.5px solid #DDD1B8',
                    color: '#5a5142',
                  }}
                >
                  + เพิ่มในตะกร้า
                </button>
              </div>
            )}
          </div>
        </div>

        {showPurchaseModal && book && (
          <PurchaseModal
            book={book}
            type={purchaseType}
            onClose={() => setShowPurchaseModal(false)}
            onSuccess={() => { setOwned(true); setShowPurchaseModal(false) }}
          />
        )}
      </div>
    </div>
  )
}
