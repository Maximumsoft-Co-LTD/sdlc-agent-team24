'use client'
import { useState, useEffect } from 'react'
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

export default function AdminBooksPage() {
  const { accessToken } = useAuth()
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [publisherFilter, setPublisherFilter] = useState('')

  const [rejectModal, setRejectModal] = useState<{ bookId: string; title: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchBooks = async () => {
    if (!accessToken) return
    setLoading(true)
    let url = '/api/v1/admin/books'
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (publisherFilter) params.set('publisher', publisherFilter)
    if (params.toString()) url += `?${params.toString()}`
    const res = await fetch(url, {
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
  }, [accessToken, statusFilter, publisherFilter])

  const handleAction = async (
    bookId: string,
    action: 'publish' | 'suspend',
    bookTitle: string
  ) => {
    if (!confirm(`ยืนยัน${action === 'publish' ? 'เผยแพร่' : 'ระงับ'}หนังสือ "${bookTitle}"?`)) return
    setActionLoading(bookId)
    const res = await fetch(`/api/v1/admin/books/${bookId}/${action}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
    })
    if (res.ok) fetchBooks()
    setActionLoading(null)
  }

  const handleReject = async () => {
    if (!rejectModal) return
    setActionLoading(rejectModal.bookId)
    const res = await fetch(`/api/v1/admin/books/${rejectModal.bookId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({ reason: rejectReason }),
    })
    if (res.ok) {
      setRejectModal(null)
      setRejectReason('')
      fetchBooks()
    }
    setActionLoading(null)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">จัดการหนังสือ</h1>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">ทุกสถานะ</option>
            <option value="draft">ร่าง</option>
            <option value="pending_review">รอรีวิว</option>
            <option value="published">เผยแพร่แล้ว</option>
            <option value="rejected">ถูกปฏิเสธ</option>
            <option value="suspended">ระงับ</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">ไม่พบหนังสือ</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ชื่อหนังสือ</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">สำนักพิมพ์</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">สถานะ</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">วันที่สร้าง</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {books.map((book: any) => (
                <tr key={book._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{book.title}</p>
                    <p className="text-xs text-gray-500">{book.author}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{book.publisherName || '-'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_COLORS[book.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {STATUS_LABELS[book.status] || book.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {book.created_at
                      ? new Date(book.created_at).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: '2-digit',
                        })
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {book.status === 'pending_review' && (
                        <>
                          <button
                            onClick={() => handleAction(book._id, 'publish', book.title)}
                            disabled={actionLoading === book._id}
                            className="text-xs text-green-700 border border-green-300 px-2 py-1 rounded hover:bg-green-50 disabled:opacity-50"
                          >
                            เผยแพร่
                          </button>
                          <button
                            onClick={() => setRejectModal({ bookId: book._id, title: book.title })}
                            disabled={actionLoading === book._id}
                            className="text-xs text-red-700 border border-red-300 px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50"
                          >
                            ปฏิเสธ
                          </button>
                        </>
                      )}
                      {book.status === 'published' && (
                        <button
                          onClick={() => handleAction(book._id, 'suspend', book.title)}
                          disabled={actionLoading === book._id}
                          className="text-xs text-orange-700 border border-orange-300 px-2 py-1 rounded hover:bg-orange-50 disabled:opacity-50"
                        >
                          ระงับ
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

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">ปฏิเสธหนังสือ</h3>
            <p className="text-gray-600 text-sm mb-4">
              "{rejectModal.title}"
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เหตุผล (ไม่บังคับ)
            </label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              placeholder="ระบุเหตุผลการปฏิเสธ..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectModal(null); setRejectReason('') }}
                className="flex-1 border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === rejectModal.bookId}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === rejectModal.bookId ? 'กำลังส่ง...' : 'ยืนยันปฏิเสธ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
