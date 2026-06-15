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

const COVER_PALETTES: Record<string, { bg: string; fg: string; accent: string; motif: string }> = {
  'นิยาย':      { bg: '#2F5D50', fg: '#F3E9D2', accent: '#C99A3F', motif: 'frame' },
  'เรื่องสั้น': { bg: '#7FA6A0', fg: '#1F2E2A', accent: '#B5491F', motif: 'arch'  },
  'สารคดี':     { bg: '#BF5A2B', fg: '#FBF1E2', accent: '#2A241C', motif: 'arch'  },
  'ไซไฟ':       { bg: '#2C3E63', fg: '#E8DFC6', accent: '#E0B45C', motif: 'rule'  },
  'สืบสวน':     { bg: '#25303A', fg: '#EBDFC4', accent: '#C99A3F', motif: 'dot'   },
  'พัฒนาตนเอง': { bg: '#E2D2AE', fg: '#3A2A12', accent: '#2F5D50', motif: 'stack' },
  'ธุรกิจ':     { bg: '#5B6E86', fg: '#EAE3D2', accent: '#E0B45C', motif: 'frame' },
  'อาหาร':      { bg: '#D9A441', fg: '#3A2A12', accent: '#7A3B1A', motif: 'arch'  },
  'ไลฟ์สไตล์':  { bg: '#6E7141', fg: '#F2ECD6', accent: '#2A241C', motif: 'stack' },
}

function BookCoverArt({ title, author, category }: { title: string; author: string; category: string }) {
  const p = COVER_PALETTES[category] || { bg: '#EFE6D2', fg: '#2A241C', accent: '#BF5A2B', motif: 'rule' }
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: p.bg, color: p.fg, overflow: 'hidden', padding: '9%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '12%', background: 'linear-gradient(90deg,rgba(0,0,0,.22),transparent)' }} />
      {p.motif === 'arch' && <div style={{ position: 'absolute', top: '-35%', right: '-20%', width: '75%', height: '75%', borderRadius: '50%', background: p.accent, opacity: .85 }} />}
      {p.motif === 'frame' && <div style={{ position: 'absolute', top: '8%', left: '8%', right: '8%', bottom: '8%', border: `2px solid ${p.accent}`, opacity: .6 }} />}
      {p.motif === 'dot' && <div style={{ position: 'absolute', bottom: '12%', right: '12%', width: '18%', height: '18%', borderRadius: '50%', background: p.accent }} />}
      {p.motif === 'stack' && (
        <div style={{ position: 'absolute', left: '10%', right: '10%', bottom: '10%', display: 'flex', flexDirection: 'column', gap: '3%' }}>
          <div style={{ height: 3, background: p.accent, width: '70%' }} />
          <div style={{ height: 3, background: p.accent, width: '50%', opacity: .7 }} />
          <div style={{ height: 3, background: p.accent, width: '36%', opacity: .5 }} />
        </div>
      )}
      <div style={{ position: 'relative', zIndex: 2, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, opacity: .75 }}>{category}</div>
      <div style={{ position: 'relative', zIndex: 2 }}>
        {p.motif === 'rule' && <div style={{ height: 2, width: '35%', background: p.accent, marginBottom: '6%' }} />}
        <div style={{ fontFamily: "'Trirong',serif", fontSize: 'clamp(16px,2.5vw,22px)', lineHeight: 1.1, fontWeight: 600, marginBottom: '5%' }}>{title}</div>
        <div style={{ fontSize: 13, opacity: .8 }}>{author}</div>
      </div>
    </div>
  )
}

export default function BookDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchaseType, setPurchaseType] = useState<'buy' | 'rent'>('buy')
  const [selectedOption, setSelectedOption] = useState<'buy' | 'rent'>('buy')
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
          const ownedList = data.owned || []
          const renting = data.renting || []
          const allBooks = [...ownedList, ...renting]
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#ECE3D2' }}>
      <div style={{ width: 32, height: 32, border: '4px solid #BF5A2B', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )
  if (!book) return null

  const rentDays = book.rent_days ?? 7

  return (
    <div style={{ backgroundColor: '#ECE3D2', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 22px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '330px 1fr', gap: 46, alignItems: 'start' }}>
          {/* Left — cover */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div style={{ borderRadius: 8, overflow: 'hidden', aspectRatio: '2/3', boxShadow: '0 18px 40px -10px rgba(42,36,28,.45),0 4px 10px rgba(42,36,28,.12)' }}>
              {book.cover_url
                ? <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <BookCoverArt title={book.title} author={book.author} category={book.category} />
              }
            </div>
            {/* meta row */}
            <div style={{ marginTop: 16, display: 'flex', gap: 16, fontSize: 13, color: '#8A7F68' }}>
              <span>248 หน้า</span>
              <span>·</span>
              <span>EPUB</span>
              <span>·</span>
              <span>ภาษาไทย</span>
            </div>
          </div>

          {/* Right — info */}
          <div>
            {/* eyebrow */}
            <div style={{ fontSize: 12, fontWeight: 600, color: '#BF5A2B', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 10 }}>
              {book.category}
            </div>
            <h1 style={{ fontFamily: "'Trirong',serif", fontSize: 'clamp(28px,3.5vw,40px)', fontWeight: 700, color: '#2A241C', lineHeight: 1.15, marginBottom: 8 }}>
              {book.title}
            </h1>
            <p style={{ fontSize: 15, color: '#6B6253', marginBottom: 18 }}>โดย {book.author}</p>
            <p style={{ fontSize: 15.5, color: '#4A4234', lineHeight: 1.75, marginBottom: 28 }}>
              {book.description}
            </p>

            {owned ? (
              <button
                onClick={() => router.push(`/read/${id}`)}
                style={{ width: '100%', height: 50, borderRadius: 12, backgroundColor: '#2F6E54', color: '#F3E9D2', border: 'none', fontFamily: "'Trirong',serif", fontSize: 17, fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 18px -8px rgba(47,110,84,.60)', marginBottom: 16 }}
              >
                อ่านเลย
              </button>
            ) : (
              <>
                {/* Buy / Rent option cards */}
                <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                  {/* Buy card */}
                  <div
                    onClick={() => setSelectedOption('buy')}
                    style={{
                      flex: 1,
                      borderRadius: 12,
                      padding: '18px 16px',
                      cursor: 'pointer',
                      position: 'relative',
                      backgroundColor: selectedOption === 'buy' ? '#2A241C' : '#fff',
                      border: selectedOption === 'buy' ? '2px solid #2A241C' : '2px solid #DDD1B8',
                      transition: 'all .14s',
                    }}
                  >
                    {selectedOption === 'buy' && (
                      <div style={{ position: 'absolute', top: 10, right: 12, width: 22, height: 22, borderRadius: '50%', backgroundColor: '#BF5A2B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    )}
                    <div style={{ fontSize: 12, fontWeight: 700, color: selectedOption === 'buy' ? '#C99A3F' : '#8A7F68', marginBottom: 6, letterSpacing: '.08em', textTransform: 'uppercase' }}>ซื้อขาด</div>
                    <div style={{ fontFamily: "'Trirong',serif", fontSize: 30, fontWeight: 700, color: selectedOption === 'buy' ? '#F3E9D2' : '#2A241C', lineHeight: 1 }}>
                      ฿{book.price_buy}
                    </div>
                    <div style={{ fontSize: 13, color: selectedOption === 'buy' ? 'rgba(243,233,210,.7)' : '#8A7F68', marginTop: 6 }}>เป็นเจ้าของถาวร</div>
                  </div>

                  {/* Rent card */}
                  {book.price_rent && (
                    <div
                      onClick={() => setSelectedOption('rent')}
                      style={{
                        flex: 1,
                        borderRadius: 12,
                        padding: '18px 16px',
                        cursor: 'pointer',
                        position: 'relative',
                        backgroundColor: selectedOption === 'rent' ? '#FBEFE3' : '#fff',
                        border: selectedOption === 'rent' ? '2px solid #BF5A2B' : '2px solid #DDD1B8',
                        transition: 'all .14s',
                      }}
                    >
                      {selectedOption === 'rent' && (
                        <div style={{ position: 'absolute', top: 10, right: 12, width: 22, height: 22, borderRadius: '50%', backgroundColor: '#BF5A2B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      )}
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#BF5A2B', marginBottom: 6, letterSpacing: '.08em', textTransform: 'uppercase' }}>ประหยัดกว่า</div>
                      <div style={{ fontFamily: "'Trirong',serif", fontSize: 30, fontWeight: 700, color: '#BF5A2B', lineHeight: 1 }}>
                        ฿{book.price_rent}
                      </div>
                      <div style={{ fontSize: 13, color: '#8A7F68', marginTop: 6 }}>เช่า {rentDays} วัน · เริ่มอ่านทันที</div>
                    </div>
                  )}
                </div>

                {/* Confirm button */}
                <button
                  onClick={() => { setPurchaseType(selectedOption); setShowPurchaseModal(true) }}
                  style={{
                    width: '100%',
                    height: 50,
                    borderRadius: 12,
                    backgroundColor: '#BF5A2B',
                    color: '#FBF6EC',
                    border: 'none',
                    fontFamily: "'Trirong',serif",
                    fontSize: 17,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 8px 18px -8px rgba(191,90,43,.70)',
                    marginBottom: 12,
                  }}
                >
                  {selectedOption === 'buy' ? `ซื้อขาด ฿${book.price_buy}` : `เช่า ฿${book.price_rent} · ${rentDays} วัน`}
                </button>

                {/* Add to cart — ghost */}
                <button
                  onClick={handleAddToCart}
                  style={{
                    width: '100%',
                    height: 46,
                    borderRadius: 12,
                    backgroundColor: 'transparent',
                    color: '#2A241C',
                    border: '1.5px solid #2A241C',
                    fontFamily: "'IBM Plex Sans Thai',system-ui,sans-serif",
                    fontSize: 15,
                    fontWeight: 500,
                    cursor: 'pointer',
                    marginBottom: 20,
                  }}
                >
                  + เพิ่มลงตะกร้า
                </button>

                {/* Rent-to-own banner */}
                <div style={{ backgroundColor: '#F3F0E6', borderRadius: 12, padding: 16, fontSize: 14, color: '#4A4234', lineHeight: 1.6 }}>
                  เช่าแล้วชอบ? อัปเกรดเป็นซื้อขาดได้เมื่อไหร่ก็ได้ — เราหักค่าเช่าที่จ่ายไปแล้วให้
                </div>
              </>
            )}
          </div>
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
