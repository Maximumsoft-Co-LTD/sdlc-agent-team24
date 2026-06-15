'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function PublisherRevenuePage() {
  const { accessToken } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0])

  const fetchRevenue = async () => {
    if (!accessToken) return
    setLoading(true)
    const res = await fetch(`/api/v1/publisher/revenue?from=${from}&to=${to}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
    })
    if (res.ok) {
      const data = await res.json()
      setItems(data.items || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (accessToken) fetchRevenue()
  }, [accessToken])

  const handleExportCsv = () => {
    window.location.href = `/api/v1/publisher/revenue?export=csv&from=${from}&to=${to}`
  }

  const inputStyle = {
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
          รายได้
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inputStyle} />
          <span style={{ color: '#6B6253' }}>—</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={inputStyle} />
          <button
            onClick={fetchRevenue}
            className="px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
          >
            ดูข้อมูล
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{ border: '1.5px solid #DDD1B8', color: '#5a5142', backgroundColor: '#FBF6EC' }}
          >
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 rounded-xl animate-pulse" style={{ backgroundColor: '#DDD1B8' }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div
          className="text-center py-16 rounded-xl"
          style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}
        >
          <p style={{ color: '#6B6253' }}>ไม่มีรายการในช่วงเวลาที่เลือก</p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-x-auto"
          style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}
        >
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: '#EFE6D2', borderBottom: '1px solid #DDD1B8' }}>
              <tr>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>วันที่</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>หนังสือ</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>ยอดขาย</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>ค่าธรรมเนียม</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>สุทธิ</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>ส่วนแบ่งฉัน</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item._id} style={{ borderBottom: '1px solid rgba(221,209,184,0.5)' }}>
                  <td className="px-4 py-3" style={{ color: '#6B6253' }}>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: '2-digit',
                        })
                      : '-'}
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: '#2A241C' }}>
                    {item.book?.title || '-'}
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: '#5a5142' }}>
                    ฿{(item.gross || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: '#9a4632' }}>
                    -฿{(item.gateway_fee || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: '#5a5142' }}>
                    ฿{(item.net || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: '#2F6E54' }}>
                    ฿{(item.publisher_share || 0).toLocaleString()}
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
