'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

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

const CATEGORIES = ['ทั้งหมด', 'นิยาย', 'วิทยาศาสตร์', 'ธุรกิจ', 'การศึกษา', 'ท่องเที่ยว', 'สุขภาพ']

const CATEGORY_COVER_BG: Record<string, string> = {
  'นิยาย': '#3D6B5A',
  'วิทยาศาสตร์': '#2F4E6B',
  'ธุรกิจ': '#5A3D2B',
  'การศึกษา': '#4A3D6B',
  'ท่องเที่ยว': '#2B5A4A',
  'สุขภาพ': '#5A4A2B',
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('newest')
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce search input 350ms
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

  return (
    <div style={{ backgroundColor: '#EFE6D2', minHeight: '100vh' }}>
      {/* Hero section */}
      <div style={{ backgroundColor: '#2F5D50' }} className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ fontFamily: "'Trirong', serif", color: '#F3E9D2' }}
          >
            ร้านหนังสือ Read24
          </h1>
          <p className="text-base mb-6" style={{ color: '#b3a88f' }}>
            ค้นพบหนังสือดีๆ หลากหลายหมวดหมู่
          </p>
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <input
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                type="text"
                placeholder="ค้นหาชื่อหนังสือ หรือผู้แต่ง..."
                className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                style={{
                  backgroundColor: '#FBF6EC',
                  border: '1.5px solid #DDD1B8',
                  color: '#2A241C',
                  paddingRight: searchQuery ? '2.5rem' : undefined,
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setDebouncedQuery('') }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg leading-none"
                  style={{ color: '#6B6253' }}
                  aria-label="ล้างคำค้นหา"
                >
                  ×
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
            >
              ค้นหา
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search result label */}
        {debouncedQuery && !loading && (
          <p className="mb-4 text-sm" style={{ color: '#5a5142' }}>
            ผลการค้นหา: <span className="font-medium" style={{ color: '#2A241C' }}>&ldquo;{debouncedQuery}&rdquo;</span>
            {` — พบ ${books.length} รายการ`}
          </p>
        )}

        {/* Category chips + sort — hidden while searching */}
        {!debouncedQuery && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {CATEGORIES.map(cat => {
            const isActive = cat === 'ทั้งหมด' ? category === '' : category === cat
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat === 'ทั้งหมด' ? '' : cat)}
                className="px-4 py-1.5 text-sm font-medium transition-colors"
                style={{
                  borderRadius: '30px',
                  backgroundColor: isActive ? '#2A241C' : 'transparent',
                  color: isActive ? '#EFE6D2' : '#5a5142',
                  border: isActive ? '1.5px solid #2A241C' : '1.5px solid #DDD1B8',
                }}
              >
                {cat}
              </button>
            )
          })}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="ml-auto text-sm rounded-lg px-3 py-1.5 focus:outline-none"
            style={{
              border: '1.5px solid #DDD1B8',
              backgroundColor: '#FBF6EC',
              color: '#2A241C',
            }}
          >
            <option value="newest">ล่าสุด</option>
            <option value="popular">ยอดนิยม</option>
          </select>
        </div>
        )}

        {/* Book grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="rounded-xl aspect-[2/3] mb-2" style={{ backgroundColor: '#DDD1B8' }}></div>
                <div className="h-4 rounded mb-1" style={{ backgroundColor: '#DDD1B8' }}></div>
                <div className="h-3 rounded w-2/3" style={{ backgroundColor: '#DDD1B8' }}></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {books.length === 0 ? (
              <div className="text-center py-16" style={{ color: '#6B6253' }}>
                <p className="text-4xl mb-3">&#128218;</p>
                <p>ยังไม่มีหนังสือในหมวดนี้</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {books.map(book => (
                  <Link key={book._id} href={`/books/${book._id}`} className="group">
                    <div
                      className="rounded-xl overflow-hidden transition-shadow hover:shadow-lg"
                      style={{
                        backgroundColor: '#FBF6EC',
                        border: '1px solid #DDD1B8',
                        boxShadow: '0 2px 8px rgba(42,36,28,0.08)',
                      }}
                    >
                      <div
                        className="relative aspect-[2/3]"
                        style={{ backgroundColor: CATEGORY_COVER_BG[book.category] || '#3D5A4A' }}
                      >
                        {book.cover_url ? (
                          <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center p-4">
                            <span
                              className="text-center text-sm font-medium leading-snug"
                              style={{ fontFamily: "'Trirong', serif", color: '#EFE6D2' }}
                            >
                              {book.title}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3
                          className="text-sm font-medium line-clamp-2 mb-0.5"
                          style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
                        >
                          {book.title}
                        </h3>
                        <p className="text-xs" style={{ color: '#6B6253' }}>{book.author}</p>
                        <div className="mt-2 space-y-0.5">
                          <p className="text-sm font-bold" style={{ color: '#2A241C' }}>
                            ฿{book.price_buy}
                          </p>
                          {book.price_rent && (
                            <p className="text-xs" style={{ color: '#6B6253' }}>
                              เช่า ฿{book.price_rent}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {nextCursor && (
              <div className="text-center mt-8">
                <button
                  onClick={() => fetchBooks(nextCursor)}
                  disabled={loadingMore}
                  className="px-8 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: '#FBF6EC',
                    border: '1.5px solid #DDD1B8',
                    color: '#5a5142',
                  }}
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
