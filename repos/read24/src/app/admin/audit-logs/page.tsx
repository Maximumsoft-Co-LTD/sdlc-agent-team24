'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const ACTION_COLORS: Record<string, string> = {
  publish: 'bg-green-100 text-green-700',
  reject: 'bg-red-100 text-red-700',
  suspend: 'bg-orange-100 text-orange-700',
  create_book: 'bg-blue-100 text-blue-700',
  payout: 'bg-purple-100 text-purple-700',
  price_change: 'bg-yellow-100 text-yellow-700',
  topup: 'bg-indigo-100 text-indigo-700',
}

const ACTION_OPTIONS = [
  { value: '', label: 'ทุกการกระทำ' },
  { value: 'publish', label: 'เผยแพร่' },
  { value: 'reject', label: 'ปฏิเสธ' },
  { value: 'suspend', label: 'ระงับ' },
  { value: 'create_book', label: 'สร้างหนังสือ' },
  { value: 'payout', label: 'จ่ายเงิน' },
  { value: 'price_change', label: 'เปลี่ยนราคา' },
  { value: 'topup', label: 'เติมเหรียญ' },
]

export default function AuditLogsPage() {
  const { accessToken } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [actionFilter, setActionFilter] = useState('')

  const fetchLogs = async (cursor?: string) => {
    if (!accessToken) return
    if (!cursor) setLoading(true)
    const params = new URLSearchParams()
    if (actionFilter) params.set('action', actionFilter)
    if (cursor) params.set('cursor', cursor)
    const res = await fetch(`/api/v1/admin/audit-logs?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
    })
    if (res.ok) {
      const data = await res.json()
      if (cursor) setLogs(prev => [...prev, ...(data.items || [])])
      else setLogs(data.items || [])
      setNextCursor(data.nextCursor)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (accessToken) {
      setLogs([])
      fetchLogs()
    }
  }, [accessToken, actionFilter])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">บันทึกการกระทำ</h1>
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {ACTION_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">ไม่พบบันทึก</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ผู้ดำเนินการ</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">การกระทำ</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">เป้าหมาย</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">หมายเหตุ</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">เวลา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log: any) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 text-xs font-mono">
                      {log.actor_user_id?.slice(-8) || '-'}
                    </p>
                    <p className="text-xs text-gray-500">{log.actor_role}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    <p>{log.target_type || '-'}</p>
                    <p className="font-mono text-gray-400">{log.target_id?.slice(-8) || ''}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                    {log.metadata?.note || '-'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {log.created_at
                      ? new Date(log.created_at).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {nextCursor && (
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => fetchLogs(nextCursor)}
                className="w-full text-sm text-red-600 hover:underline py-1"
              >
                โหลดเพิ่มเติม
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
