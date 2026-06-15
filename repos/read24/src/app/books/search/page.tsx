'use client'
import { useState, useEffect, Suspense } from 'react'
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}

function SearchPageContent() {
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ค้นหาหนังสือ</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          type="text"
          placeholder="ค้นหาหนังสือ..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">ค้นหา</button>
      </form>

      {q && (
        <p className="text-gray-500 mb-4">
          ผลการค้นหา: <span className="font-medium text-gray-900">&quot;{q}&quot;</span>
          {!loading && ` — พบ ${books.length} รายการ`}
        </p>
      )}

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
      ) : books.length === 0 && q ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🔍</p>
          <p>ไม่พบหนังสือที่ค้นหา</p>
          <Link href="/books" className="mt-3 inline-block text-indigo-600 hover:underline">ดูหนังสือทั้งหมด</Link>
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
    </div>
  )
}
