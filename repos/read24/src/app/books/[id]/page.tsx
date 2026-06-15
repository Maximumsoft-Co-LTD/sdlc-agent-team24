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
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
    </div>
  )
  if (!book) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-[280px_1fr] gap-8">
        <div>
          <div className="rounded-xl overflow-hidden shadow-lg aspect-[2/3] bg-gradient-to-br from-indigo-100 to-purple-100">
            {book.cover_url ? (
              <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-6 text-center font-medium text-indigo-700">{book.title}</div>
            )}
          </div>
        </div>

        <div>
          <span className="text-sm text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-full">{book.category}</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">{book.title}</h1>
          <p className="text-gray-500 mt-1">โดย {book.author}</p>
          <p className="text-gray-700 mt-4 leading-relaxed">{book.description}</p>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-gray-900">฿{book.price_buy}</span>
              <span className="text-gray-500 text-sm">ซื้อขาด</span>
            </div>
            {book.price_rent && (
              <p className="text-gray-600 text-sm">เช่า ฿{book.price_rent} / {book.rent_days ?? 7} วัน</p>
            )}
          </div>

          {owned ? (
            <button onClick={() => router.push(`/read/${id}`)}
              className="mt-4 w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700">
              อ่านเลย
            </button>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              <button onClick={() => { setPurchaseType('buy'); setShowPurchaseModal(true) }}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700">
                ซื้อ ฿{book.price_buy}
              </button>
              {book.price_rent && (
                <button onClick={() => { setPurchaseType('rent'); setShowPurchaseModal(true) }}
                  className="w-full border-2 border-indigo-600 text-indigo-600 py-3 rounded-xl font-medium hover:bg-indigo-50">
                  เช่า ฿{book.price_rent} / {book.rent_days ?? 7} วัน
                </button>
              )}
              <button onClick={handleAddToCart}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200">
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
  )
}
