'use client'
import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface Book {
  _id: string
  title: string
  author: string
  description: string
  category: string
  cover_url: string | null
  price_buy: number
  price_rent: number | null
  status: string
}

const CATEGORIES = ['ทั้งหมด', 'นิยาย', 'เรื่องสั้น', 'สารคดี', 'ไซไฟ', 'สืบสวน', 'พัฒนาตนเอง', 'ธุรกิจ', 'อาหาร', 'ไลฟ์สไตล์']

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
      {/* spine shadow */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '12%', background: 'linear-gradient(90deg,rgba(0,0,0,.22),transparent)' }} />
      {/* motif */}
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
      {/* content */}
      <div style={{ position: 'relative', zIndex: 2, fontSize: 'clamp(9px,3.5vw,12px)', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, opacity: .75, fontFamily: "'IBM Plex Sans Thai',system-ui,sans-serif" }}>{category}</div>
      <div style={{ position: 'relative', zIndex: 2 }}>
        {p.motif === 'rule' && <div style={{ height: 2, width: '35%', background: p.accent, marginBottom: '6%' }} />}
        <div style={{ fontFamily: "'Trirong',serif", fontSize: 'clamp(13px,3vw,18px)', lineHeight: 1.05, fontWeight: 600, marginBottom: '5%' }}>{title}</div>
        <div style={{ fontFamily: "'IBM Plex Sans Thai',system-ui,sans-serif", fontSize: 'clamp(9px,2vw,12px)', opacity: .8 }}>{author}</div>
      </div>
    </div>
  )
}

function BooksPageInner() {
  const { user, accessToken } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('newest')
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Sync search from URL param on mount
  useEffect(() => {
    const q = searchParams.get('q') || ''
    if (q) {
      setSearchQuery(q)
      setDebouncedQuery(q)
    }
  }, [])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(value.trim()), 350)
  }

  const fetchBooks = useCallback(async (cursor: string | null = null, signal?: AbortSignal) => {
    setLoadingMore(!!cursor)
    try {
      let items: Book[] = []
      let nc: string | null = null
      if (debouncedQuery) {
        const res = await fetch(`/api/v1/books/search?q=${encodeURIComponent(debouncedQuery)}&limit=40`, { signal })
        if (!res.ok) throw new Error('fetch failed')
        const data = await res.json()
        items = data.items || []
      } else {
        const params = new URLSearchParams({ limit: '20', sort })
        if (category) params.set('category', category)
        if (cursor) params.set('cursor', cursor)
        const res = await fetch(`/api/v1/books?${params}`, { signal })
        if (!res.ok) throw new Error('fetch failed')
        const data = await res.json()
        items = data.items || []
        nc = data.nextCursor ?? null
      }
      if (cursor) setBooks(prev => [...prev, ...items])
      else setBooks(items)
      setNextCursor(nc)
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setBooks(prev => cursor ? prev : [])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [category, sort, debouncedQuery])

  useEffect(() => {
    setLoading(true)
    setBooks([])
    setNextCursor(null)
    const controller = new AbortController()
    fetchBooks(null, controller.signal)
    return () => controller.abort()
  }, [fetchBooks])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setDebouncedQuery(searchQuery.trim())
  }

  const handleAddToCart = async (e: React.MouseEvent, bookId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { router.push('/login'); return }
    const res = await fetch('/api/v1/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ bookId }),
      credentials: 'include',
    })
    const data = await res.json()
    if (res.ok) alert('เพิ่มในตะกร้าแล้ว!')
    else if (data.error === 'DUPLICATE') alert('หนังสือนี้อยู่ในตะกร้าแล้ว')
    else alert('เกิดข้อผิดพลาด')
  }

  const categoryLabel = category || 'ทุกหมวด'

  return (
    <div style={{ backgroundColor: '#ECE3D2', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '22px 22px 0' }}>
        {/* Hero card */}
        <div style={{ background: 'linear-gradient(135deg,#2F5D50,#264A40)', borderRadius: 22, padding: '46px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: "'Trirong',serif", fontSize: 'clamp(28px,4vw,46px)', fontWeight: 700, color: '#F3E9D2', lineHeight: 1.1, marginBottom: 12 }}>
              ซื้อ · เช่า · อ่าน<br />หนังสือดีทุกวัน
            </h1>
            <p style={{ color: 'rgba(243,233,210,.72)', marginBottom: 24, fontSize: 15 }}>เลือกซื้อขาดหรือเช่าอ่านรายเล่ม พร้อมระบบกระเป๋าเหรียญ</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => { document.getElementById('book-grid')?.scrollIntoView({ behavior: 'smooth' }) }}
                style={{ background: '#BF5A2B', color: '#FBF6EC', border: 'none', borderRadius: 10, padding: '12px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer', fontFamily: "'IBM Plex Sans Thai',system-ui,sans-serif" }}
              >
                เลือกซื้อหนังสือ
              </button>
              <button
                onClick={() => router.push('/library')}
                style={{ background: 'transparent', color: '#F3E9D2', border: '1.5px solid rgba(243,233,210,.4)', borderRadius: 10, padding: '12px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer', fontFamily: "'IBM Plex Sans Thai',system-ui,sans-serif" }}
              >
                ดูชั้นหนังสือ
              </button>
            </div>
          </div>
          {/* 3-book fan */}
          <div style={{ display: 'flex', alignItems: 'flex-end', flexShrink: 0, gap: 0 }}>
            {[{ rot: -9, z: 1, my: 16, ml: 0 }, { rot: 0, z: 3, my: 0, ml: -22 }, { rot: 9, z: 2, my: 16, ml: -22 }].map((b, i) => (
              <div key={i} style={{ width: 100, aspectRatio: '2/3', borderRadius: 6, overflow: 'hidden', boxShadow: '0 18px 40px -14px rgba(0,0,0,.55)', transform: `rotate(${b.rot}deg) translateY(${b.my}px)`, marginLeft: b.ml, zIndex: b.z, position: 'relative', flexShrink: 0 }}>
                <div style={{ width: '100%', height: '100%', background: ['#2C3E63', '#BF5A2B', '#2F5D50'][i] }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 22px 40px' }} id="book-grid">
        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, marginBottom: 20, maxWidth: 520 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              type="text"
              placeholder="ค้นหาชื่อหนังสือ หรือผู้แต่ง..."
              style={{
                width: '100%',
                backgroundColor: '#FBF9F2',
                border: '1.5px solid #DDD1B8',
                borderRadius: 10,
                padding: '9px 36px 9px 14px',
                fontSize: 14,
                color: '#2A241C',
                outline: 'none',
                fontFamily: "'IBM Plex Sans Thai',system-ui,sans-serif",
                boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setDebouncedQuery('') }}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: 16, color: '#6B6253', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                aria-label="ล้างคำค้นหา"
              >×</button>
            )}
          </div>
          <button
            type="submit"
            style={{ padding: '9px 18px', borderRadius: 10, backgroundColor: '#BF5A2B', color: '#FBF6EC', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: "'IBM Plex Sans Thai',system-ui,sans-serif", whiteSpace: 'nowrap' }}
          >
            ค้นหา
          </button>
        </form>

        {/* Search result label */}
        {debouncedQuery && !loading && (
          <p style={{ marginBottom: 16, fontSize: 14, color: '#4A4234' }}>
            ผลการค้นหา: <span style={{ fontWeight: 600, color: '#2A241C' }}>&ldquo;{debouncedQuery}&rdquo;</span>
            {` — พบ ${books.length} รายการ`}
          </p>
        )}

        {/* Category chips + sort */}
        {!debouncedQuery && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            {CATEGORIES.map(cat => {
              const isActive = cat === 'ทั้งหมด' ? category === '' : category === cat
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat === 'ทั้งหมด' ? '' : cat)}
                  style={{
                    borderRadius: 30,
                    padding: '9px 16px',
                    fontWeight: 600,
                    fontSize: 14,
                    backgroundColor: isActive ? '#2A241C' : '#FBF6EC',
                    color: isActive ? '#FBF6EC' : '#5A5142',
                    border: isActive ? '1.5px solid #2A241C' : '1.5px solid #DDD1B8',
                    cursor: 'pointer',
                    fontFamily: "'IBM Plex Sans Thai',system-ui,sans-serif",
                    transition: 'all .12s',
                  }}
                >
                  {cat}
                </button>
              )
            })}
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{
                marginLeft: 'auto',
                fontSize: 14,
                borderRadius: 10,
                padding: '9px 12px',
                border: '1.5px solid #DDD1B8',
                backgroundColor: '#FBF6EC',
                color: '#2A241C',
                outline: 'none',
                cursor: 'pointer',
                fontFamily: "'IBM Plex Sans Thai',system-ui,sans-serif",
              }}
            >
              <option value="newest">ล่าสุด</option>
              <option value="popular">ยอดนิยม</option>
            </select>
          </div>
        )}

        {/* Toolbar */}
        {!debouncedQuery && (
          <div style={{ borderBottom: '1px solid #E0D5BE', paddingBottom: 12, marginBottom: 22 }}>
            <h2 style={{ fontFamily: "'Trirong',serif", fontSize: 20, fontWeight: 600, color: '#2A241C', margin: 0 }}>
              {categoryLabel} · {books.length} เล่ม
            </h2>
          </div>
        )}

        {/* Book grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(216px,1fr))', gap: '26px 22px' }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ animation: 'pulse 1.5s infinite' }}>
                <div style={{ borderRadius: 12, aspectRatio: '2/3', marginBottom: 8, backgroundColor: '#DDD1B8' }} />
                <div style={{ height: 14, borderRadius: 6, marginBottom: 6, backgroundColor: '#DDD1B8' }} />
                <div style={{ height: 12, borderRadius: 6, width: '60%', backgroundColor: '#DDD1B8' }} />
              </div>
            ))}
          </div>
        ) : (
          <>
            {books.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 0', color: '#6B6253' }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>📚</p>
                <p>ยังไม่มีหนังสือในหมวดนี้</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(216px,1fr))', gap: '26px 22px' }}>
                {books.map(book => (
                  <Link key={book._id} href={`/books/${book._id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#fff', border: '1px solid #E0D5BE', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 4px rgba(42,36,28,.10),0 14px 26px -16px rgba(42,36,28,.40)', transition: 'box-shadow .15s', animation: 'r24in .4s' }}>
                      {/* cover */}
                      <div style={{ position: 'relative', aspectRatio: '2/3' }}>
                        {book.cover_url
                          ? <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          : <BookCoverArt title={book.title} author={book.author} category={book.category} />
                        }
                        {/* add to cart */}
                        <button
                          onClick={e => handleAddToCart(e, book._id)}
                          style={{ position: 'absolute', bottom: 8, right: 8, width: 38, height: 38, borderRadius: 10, background: 'rgba(42,36,28,.92)', color: '#FBF6EC', border: 'none', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 300, lineHeight: 1 }}
                          title="เพิ่มลงตะกร้า"
                        >+</button>
                      </div>
                      {/* info */}
                      <div style={{ padding: '12px 14px' }}>
                        <div style={{ fontFamily: "'Trirong',serif", fontSize: 17, fontWeight: 600, lineHeight: 1.25, color: '#2A241C', marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{book.title}</div>
                        <div style={{ fontSize: 13, color: '#8A7F68', marginBottom: 10 }}>{book.author}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div>
                            <span style={{ fontFamily: "'Trirong',serif", fontWeight: 700, fontSize: 16, color: '#2A241C' }}>฿{book.price_buy}</span>
                            <span style={{ fontSize: 12, color: '#8A7F68', marginLeft: 4 }}>ซื้อขาด</span>
                          </div>
                          {book.price_rent && (
                            <span style={{ background: '#F7E4D5', color: '#BF5A2B', border: '1px solid #EAC9B3', borderRadius: 30, padding: '4px 10px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                              เช่า ฿{book.price_rent} · 7 วัน
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {nextCursor && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button
                  onClick={() => fetchBooks(nextCursor)}
                  disabled={loadingMore}
                  style={{ padding: '10px 32px', borderRadius: 10, fontSize: 14, fontWeight: 500, backgroundColor: '#FBF6EC', border: '1.5px solid #DDD1B8', color: '#5A5142', cursor: 'pointer', opacity: loadingMore ? .5 : 1, fontFamily: "'IBM Plex Sans Thai',system-ui,sans-serif" }}
                >
                  {loadingMore ? 'กำลังโหลด...' : 'โหลดเพิ่มเติม'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function BooksPage() {
  return (
    <Suspense>
      <BooksPageInner />
    </Suspense>
  )
}
