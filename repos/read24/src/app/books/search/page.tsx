'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Book {
  _id: string
  title: string
  author: string
  category: string
  cover_url: string | null
  price_buy: number
  price_rent: number | null
}

const CATEGORY_COVER_BG: Record<string, string> = {
  'นิยาย': '#3D6B5A',
  'วิทยาศาสตร์': '#2F4E6B',
  'ธุรกิจ': '#5A3D2B',
  'การศึกษา': '#4A3D6B',
  'ท่องเที่ยว': '#2B5A4A',
  'สุขภาพ': '#5A4A2B',
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [searchInput, setSearchInput] = useState(q)
  const router = useRouter()

  useEffect(() => {
    if (!q) return
    setLoading(true)
    fetch(`/api/v1/books/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(data => {
        setBooks(data.items || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [q])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      router.push(`/books/search?q=${encodeURIComponent(searchInput.trim())}`)
    }
  }

  return (
    <div style={{ backgroundColor: '#EFE6D2', minHeight: '100vh' }}>
      {/* Hero bar */}
      <div style={{ backgroundColor: '#2F5D50' }} className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: "'Trirong', serif", color: '#F3E9D2' }}
          >
            ค้นหาหนังสือ
          </h1>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              type="text"
              placeholder="ค้นหาหนังสือ ชื่อผู้แต่ง..."
              className="flex-1 rounded-lg px-4 py-2.5 text-sm focus:outline-none"
              style={{
                backgroundColor: '#FBF6EC',
                border: '1.5px solid #DDD1B8',
                color: '#2A241C',
              }}
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
            >
              ค้นหา
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {q && (
          <p className="mb-4 text-sm" style={{ color: '#5a5142' }}>
            ผลการค้นหา: <span className="font-medium" style={{ color: '#2A241C' }}>&quot;{q}&quot;</span>
            {!loading && ` — พบ ${books.length} รายการ`}
          </p>
        )}

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
        ) : books.length === 0 && q ? (
          <div className="text-center py-16" style={{ color: '#6B6253' }}>
            <p className="text-4xl mb-3">&#128269;</p>
            <p>ไม่พบหนังสือที่ค้นหา</p>
            <Link
              href="/books"
              className="mt-3 inline-block font-medium"
              style={{ color: '#BF5A2B' }}
            >
              ดูหนังสือทั้งหมด
            </Link>
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
                      <p className="text-sm font-bold" style={{ color: '#2A241C' }}>฿{book.price_buy}</p>
                      {book.price_rent && (
                        <p className="text-xs" style={{ color: '#6B6253' }}>เช่า ฿{book.price_rent}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
