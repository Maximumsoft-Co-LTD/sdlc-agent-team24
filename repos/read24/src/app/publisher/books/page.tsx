'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

const STATUS_LABELS: Record<string, string> = {
  draft: 'ร่าง',
  pending_review: 'รอรีวิว',
  published: 'เผยแพร่แล้ว',
  rejected: 'ถูกปฏิเสธ',
  suspended: 'ระงับ',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending_review: 'bg-yellow-100 text-yellow-700',
  published: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  suspended: 'bg-orange-100 text-orange-700',
}

export default function PublisherBooksPage() {
  const { accessToken } = useAuth()
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)

  const fetchBooks = async () => {
    if (!accessToken) return
    const res = await fetch('/api/v1/publisher/books', {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
    })
    if (res.ok) {
      const data = await res.json()
      setBooks(data.books || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (accessToken) fetchBooks()
  }, [accessToken])

  const handleSubmitReview = async (bookId: string) => {
    setSubmitting(bookId)
    const res = await fetch(`/api/v1/publisher/books/${bookId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
    })
    if (res.ok) fetchBooks()
    setSubmitting(null)
  }

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">หนังสือของฉัน</h1>
        <Link
          href="/publisher/books/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
        >
          + เพิ่มหนังสือใหม่
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-gray-500 mb-4">ยังไม่มีหนังสือ</p>
          <Link href="/publisher/books/new" className="text-indigo-600 hover:underline">
            เพิ่มหนังสือเล่มแรก
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ชื่อหนังสือ</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">หมวดหมู่</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ราคา</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">สถานะ</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {books.map((book: any) => (
                <tr key={book._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{book.title}</p>
                    <p className="text-xs text-gray-500">{book.author}</p>
                    {book.status === 'rejected' && book.rejection_reason && (
                      <p className="text-xs text-red-600 mt-1">
                        เหตุผล: {book.rejection_reason}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{book.category || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    ฿{book.price_buy?.toLocaleString()}
                    {book.price_rent && (
                      <span className="text-xs text-gray-400 block">เช่า ฿{book.price_rent}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_COLORS[book.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {STATUS_LABELS[book.status] || book.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {(book.status === 'draft' || book.status === 'rejected') && (
                        <Link
                          href={`/publisher/books/${book._id}/edit`}
                          className="text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-300 px-2 py-1 rounded"
                        >
                          แก้ไข
                        </Link>
                      )}
                      {book.status === 'draft' && book.epub_key && (
                        <button
                          onClick={() => handleSubmitReview(book._id)}
                          disabled={submitting === book._id}
                          className="text-xs text-green-700 hover:text-green-900 border border-green-300 px-2 py-1 rounded disabled:opacity-50"
                        >
                          {submitting === book._id ? 'กำลังส่ง...' : 'ส่งให้รีวิว'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
