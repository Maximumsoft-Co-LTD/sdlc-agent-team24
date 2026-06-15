'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

// Design-system status badge styles
const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  published: { bg: '#E0EFE7', fg: '#2F6E54' },
  pending_review: { bg: '#FBEFD6', fg: '#8a6a16' },
  draft: { bg: '#ECEAE2', fg: '#7a7263' },
  suspended: { bg: '#F6E0DA', fg: '#9a4632' },
  rejected: { bg: '#F6E0DA', fg: '#9a4632' },
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'ฉบับร่าง',
  pending_review: 'รออนุมัติ',
  published: 'เผยแพร่',
  rejected: 'ถูกปฏิเสธ',
  suspended: 'ระงับ',
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

  const handleAction = async (bookId: string, action: 'publish' | 'suspend', bookTitle: string) => {
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
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
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

  const selectStyle = {
    border: '1.5px solid #DDD1B8',
    backgroundColor: '#FBF6EC',
    color: '#2A241C',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '14px',
    outline: 'none',
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
        >
          จัดการหนังสือ
        </h1>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="">ทุกสถานะ</option>
            <option value="draft">ฉบับร่าง</option>
            <option value="pending_review">รออนุมัติ</option>
            <option value="published">เผยแพร่</option>
            <option value="rejected">ถูกปฏิเสธ</option>
            <option value="suspended">ระงับ</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: '#DDD1B8' }} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div
          className="text-center py-16 rounded-xl"
          style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}
        >
          <p style={{ color: '#6B6253' }}>ไม่พบหนังสือ</p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-x-auto"
          style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}
        >
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: '#EFE6D2', borderBottom: '1px solid #DDD1B8' }}>
              <tr>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>ชื่อหนังสือ</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>สำนักพิมพ์</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>สถานะ</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>วันที่สร้าง</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book: any) => {
                const statusStyle = STATUS_STYLES[book.status] || { bg: '#ECEAE2', fg: '#7a7263' }
                return (
                  <tr
                    key={book._id}
                    style={{ borderBottom: '1px solid rgba(221,209,184,0.5)' }}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: '#2A241C' }}>{book.title}</p>
                      <p className="text-xs" style={{ color: '#6B6253' }}>{book.author}</p>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#5a5142' }}>
                      {book.publisherName || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.fg }}
                      >
                        {STATUS_LABELS[book.status] || book.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#6B6253' }}>
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
                              className="text-xs px-2 py-1 rounded transition-colors disabled:opacity-50"
                              style={{ border: '1px solid #2F6E54', color: '#2F6E54', backgroundColor: '#E0EFE7' }}
                            >
                              เผยแพร่
                            </button>
                            <button
                              onClick={() => setRejectModal({ bookId: book._id, title: book.title })}
                              disabled={actionLoading === book._id}
                              className="text-xs px-2 py-1 rounded transition-colors disabled:opacity-50"
                              style={{ border: '1px solid #9a4632', color: '#9a4632', backgroundColor: '#F6E0DA' }}
                            >
                              ปฏิเสธ
                            </button>
                          </>
                        )}
                        {book.status === 'published' && (
                          <button
                            onClick={() => handleAction(book._id, 'suspend', book.title)}
                            disabled={actionLoading === book._id}
                            className="text-xs px-2 py-1 rounded transition-colors disabled:opacity-50"
                            style={{ border: '1px solid #8a6a16', color: '#8a6a16', backgroundColor: '#FBEFD6' }}
                          >
                            ระงับ
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

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-2xl p-6 max-w-md w-full" style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}>
            <h3
              className="text-lg font-bold mb-2"
              style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
            >
              ปฏิเสธหนังสือ
            </h3>
            <p className="text-sm mb-4" style={{ color: '#5a5142' }}>"{rejectModal.title}"</p>
            <label className="block text-sm font-medium mb-1" style={{ color: '#5a5142' }}>
              เหตุผล (ไม่บังคับ)
            </label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none mb-4"
              style={{ border: '1.5px solid #DDD1B8', backgroundColor: '#EFE6D2', color: '#2A241C' }}
              placeholder="ระบุเหตุผลการปฏิเสธ..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectModal(null); setRejectReason('') }}
                className="flex-1 py-2 rounded-lg text-sm font-medium"
                style={{ border: '1.5px solid #DDD1B8', color: '#5a5142', backgroundColor: '#EFE6D2' }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === rejectModal.bookId}
                className="flex-1 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
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
