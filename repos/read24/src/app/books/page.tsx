'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('newest')
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const fetchBooks = useCallback(async (reset = true, cursor?: string | null) => {
    if (reset) setLoading(true)
    else setLoadingMore(true)

    const params = new URLSearchParams({ limit: '20', sort })
    if (category) params.set('category', category)
    if (!reset && cursor) params.set('cursor', cursor)

    const res = await fetch(`/api/v1/books?${params}`)
    const data = await res.json()

    if (reset) setBooks(data.items || [])
    else setBooks(prev => [...prev, ...(data.items || [])])
    setNextCursor(data.nextCursor)
    setLoading(false)
    setLoadingMore(false)
  }, [category, sort])

  useEffect(() => { fetchBooks(true) }, [category, sort])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/books/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">ร้านหนังสือ</h1>

      {/* Search bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            type="text"
            placeholder="ค้นหาหนังสือ..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">ค้นหา</button>
        </form>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {CATEGORIES.map(cat => (
          <button key={cat}
            onClick={() => setCategory(cat === 'ทั้งหมด' ? '' : cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${(cat === 'ทั้งหมด' ? category === '' : category === cat) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {cat}
          </button>
        ))}
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="ml-auto border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="newest">ล่าสุด</option>
          <option value="popular">ยอดนิยม</option>
        </select>
      </div>

      {/* Book grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg aspect-[2/3] mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {books.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-3">📚</p>
              <p>ยังไม่มีหนังสือในหมวดนี้</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {books.map(book => (
                <Link key={book._id} href={`/books/${book._id}`} className="group">
                  <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="relative aspect-[2/3] bg-gradient-to-br from-indigo-100 to-purple-100">
                      {book.cover_url ? (
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-4">
                          <span className="text-center text-sm font-medium text-indigo-700">{book.title}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-gray-900 line-clamp-2 group-hover:text-indigo-600">{book.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
                      <div className="mt-2 space-y-0.5">
                        <p className="text-sm font-bold text-gray-900">฿{book.price_buy}</p>
                        {book.price_rent && <p className="text-xs text-gray-500">เช่า ฿{book.price_rent}</p>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {nextCursor && (
            <div className="text-center mt-8">
              <button onClick={() => fetchBooks(false, nextCursor)} disabled={loadingMore}
                className="bg-white border border-gray-300 text-gray-700 px-8 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                {loadingMore ? 'กำลังโหลด...' : 'โหลดเพิ่มเติม'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
