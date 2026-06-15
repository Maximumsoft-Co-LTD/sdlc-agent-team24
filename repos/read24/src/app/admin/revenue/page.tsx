'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Summary {
  gmv: number
  gatewayFee: number
  net: number
  platformCut: number
  publisherShare: number
}

interface ByPublisher {
  publisherId: string
  publisherName: string | null
  gmv: number
  publisherShare: number
  count: number
}

export default function AdminRevenuePage() {
  const { accessToken } = useAuth()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [byPublisher, setByPublisher] = useState<ByPublisher[]>([])
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
    const res = await fetch(`/api/v1/admin/revenue?from=${from}&to=${to}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
    })
    if (res.ok) {
      const data = await res.json()
      setSummary(data.summary)
      setByPublisher(data.byPublisher || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (accessToken) fetchRevenue()
  }, [accessToken])

  const handleExportCsv = () => {
    window.location.href = `/api/v1/admin/revenue?export=csv&from=${from}&to=${to}`
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: '#DDD1B8' }} />
          ))}
        </div>
      ) : summary ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'GMV', value: summary.gmv, color: '#2F5D50' },
              { label: 'ค่าธรรมเนียม', value: summary.gatewayFee, color: '#9a4632' },
              { label: 'สุทธิ', value: summary.net, color: '#2A241C' },
              { label: 'Read24 ได้', value: summary.platformCut, color: '#BF5A2B' },
              { label: 'สำนักพิมพ์ได้', value: summary.publisherShare, color: '#2F6E54' },
            ].map(item => (
              <div
                key={item.label}
                className="rounded-xl p-4"
                style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}
              >
                <p className="text-xs mb-1" style={{ color: '#6B6253' }}>{item.label}</p>
                <p className="text-xl font-bold" style={{ color: item.color }}>
                  ฿{item.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {byPublisher.length === 0 ? (
            <div
              className="text-center py-16 rounded-xl"
              style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}
            >
              <p style={{ color: '#6B6253' }}>ไม่มีข้อมูลในช่วงเวลาที่เลือก</p>
            </div>
          ) : (
            <div
              className="rounded-xl overflow-x-auto"
              style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}
            >
              <h2 className="text-sm font-semibold px-4 py-3" style={{ color: '#5a5142', borderBottom: '1px solid #DDD1B8' }}>
                แยกตามสำนักพิมพ์
              </h2>
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: '#EFE6D2', borderBottom: '1px solid #DDD1B8' }}>
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>สำนักพิมพ์</th>
                    <th className="text-right px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>GMV</th>
                    <th className="text-right px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>ส่วนแบ่ง</th>
                    <th className="text-right px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>รายการ</th>
                  </tr>
                </thead>
                <tbody>
                  {byPublisher.map(pub => (
                    <tr key={pub.publisherId} style={{ borderBottom: '1px solid rgba(221,209,184,0.5)' }}>
                      <td className="px-4 py-3 font-medium" style={{ color: '#2A241C' }}>
                        {pub.publisherName || pub.publisherId}
                      </td>
                      <td className="px-4 py-3 text-right" style={{ color: '#5a5142' }}>
                        ฿{pub.gmv.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-medium" style={{ color: '#2F6E54' }}>
                        ฿{pub.publisherShare.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right" style={{ color: '#6B6253' }}>
                        {pub.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <p className="text-center py-8" style={{ color: '#6B6253' }}>ไม่สามารถโหลดข้อมูลได้</p>
      )}
    </div>
  )
}
