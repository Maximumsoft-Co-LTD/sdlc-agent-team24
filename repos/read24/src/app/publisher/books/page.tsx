'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  published: { bg: '#E0EFE7', fg: '#2F6E54' },
  pending_review: { bg: '#FBEFD6', fg: '#8a6a16' },
  draft: { bg: '#ECEAE2', fg: '#7a7263' },
  rejected: { bg: '#F6E0DA', fg: '#9a4632' },
  suspended: { bg: '#F6E0DA', fg: '#9a4632' },
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'ฉบับร่าง',
  pending_review: 'รออนุมัติ',
  published: 'เผยแพร่',
  rejected: 'ถูกปฏิเสธ',
  suspended: 'ระงับ',
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
        <div
          className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full"
          style={{ borderColor: '#BF5A2B', borderTopColor: 'transparent' }}
        />
      </div>
    )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
        >
          หนังสือของฉัน
        </h1>
        <Link
          href="/publisher/books/new"
          className="px-4 py-2 rounded-lg font-medium text-sm"
          style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
        >
          + เพิ่มหนังสือใหม่
        </Link>
      </div>

      {books.length === 0 ? (
        <div
          className="text-center py-16 rounded-xl"
          style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}
        >
          <p className="text-4xl mb-3">&#128218;</p>
          <p className="mb-4" style={{ color: '#6B6253' }}>ยังไม่มีหนังสือ</p>
          <Link
            href="/publisher/books/new"
            className="font-medium"
            style={{ color: '#BF5A2B' }}
          >
            เพิ่มหนังสือเล่มแรก
          </Link>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}
        >
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: '#EFE6D2', borderBottom: '1px solid #DDD1B8' }}>
              <tr>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>ชื่อหนังสือ</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>หมวดหมู่</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>ราคา</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>สถานะ</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book: any) => {
                const statusStyle = STATUS_STYLES[book.status] || { bg: '#ECEAE2', fg: '#7a7263' }
                return (
                  <tr key={book._id} style={{ borderBottom: '1px solid rgba(221,209,184,0.5)' }}>
                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: '#2A241C' }}>{book.title}</p>
                      <p className="text-xs" style={{ color: '#6B6253' }}>{book.author}</p>
                      {book.status === 'rejected' && book.rejection_reason && (
                        <p className="text-xs mt-1" style={{ color: '#9a4632' }}>
                          เหตุผล: {book.rejection_reason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3" style={{ color: '#5a5142' }}>{book.category || '-'}</td>
                    <td className="px-4 py-3" style={{ color: '#5a5142' }}>
                      ฿{book.price_buy?.toLocaleString()}
                      {book.price_rent && (
                        <span className="text-xs block" style={{ color: '#6B6253' }}>
                          เช่า ฿{book.price_rent}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.fg }}
                      >
                        {STATUS_LABELS[book.status] || book.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {(book.status === 'draft' || book.status === 'rejected') && (
                          <Link
                            href={`/publisher/books/${book._id}/edit`}
                            className="text-xs px-2 py-1 rounded"
                            style={{ border: '1px solid #2F6E54', color: '#2F6E54', backgroundColor: '#E0EFE7' }}
                          >
                            แก้ไข
                          </Link>
                        )}
                        {book.status === 'draft' && book.epub_key && (
                          <button
                            onClick={() => handleSubmitReview(book._id)}
                            disabled={submitting === book._id}
                            className="text-xs px-2 py-1 rounded disabled:opacity-50"
                            style={{ border: '1px solid #BF5A2B', color: '#BF5A2B', backgroundColor: '#FBF1E2' }}
                          >
                            {submitting === book._id ? 'กำลังส่ง...' : 'ส่งให้รีวิว'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
