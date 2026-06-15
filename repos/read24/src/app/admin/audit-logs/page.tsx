'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const ACTION_STYLES: Record<string, { bg: string; fg: string }> = {
  publish: { bg: '#E0EFE7', fg: '#2F6E54' },
  reject: { bg: '#F6E0DA', fg: '#9a4632' },
  suspend: { bg: '#FBEFD6', fg: '#8a6a16' },
  create_book: { bg: 'rgba(47,93,80,0.12)', fg: '#2F5D50' },
  payout: { bg: 'rgba(201,154,63,0.15)', fg: '#8a6a16' },
  price_change: { bg: '#FBEFD6', fg: '#8a6a16' },
  topup: { bg: 'rgba(47,93,80,0.12)', fg: '#2F5D50' },
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
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
        >
          บันทึกการกระทำ
        </h1>
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="rounded-lg px-3 py-1.5 text-sm focus:outline-none"
          style={{ border: '1.5px solid #DDD1B8', backgroundColor: '#FBF6EC', color: '#2A241C' }}
        >
          {ACTION_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: '#DDD1B8' }} />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div
          className="text-center py-16 rounded-xl"
          style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}
        >
          <p style={{ color: '#6B6253' }}>ไม่พบบันทึก</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-x-auto" style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}>
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: '#EFE6D2', borderBottom: '1px solid #DDD1B8' }}>
              <tr>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>ผู้ดำเนินการ</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>การกระทำ</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>เป้าหมาย</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>หมายเหตุ</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>เวลา</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => {
                const actionStyle = ACTION_STYLES[log.action] || { bg: '#ECEAE2', fg: '#7a7263' }
                return (
                  <tr key={log._id} style={{ borderBottom: '1px solid rgba(221,209,184,0.5)' }}>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-medium" style={{ color: '#2A241C' }}>
                        {log.actor_user_id?.slice(-8) || '-'}
                      </p>
                      <p className="text-xs" style={{ color: '#6B6253' }}>{log.actor_role}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: actionStyle.bg, color: actionStyle.fg }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#5a5142' }}>
                      <p>{log.target_type || '-'}</p>
                      <p className="font-mono" style={{ color: '#6B6253' }}>
                        {log.target_id?.slice(-8) || ''}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs max-w-xs truncate" style={{ color: '#6B6253' }}>
                      {log.metadata?.note || '-'}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: '#6B6253' }}>
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
                )
              })}
            </tbody>
          </table>
          {nextCursor && (
            <div className="p-4" style={{ borderTop: '1px solid #DDD1B8' }}>
              <button
                onClick={() => fetchLogs(nextCursor)}
                className="w-full text-sm py-1 font-medium"
                style={{ color: '#BF5A2B' }}
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
