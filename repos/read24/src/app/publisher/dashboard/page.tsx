'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardData {
  myGmv: number
  myPublisherShare: number
  bookCount: number
  soldCount: number
  rentCount: number
}

export default function PublisherDashboardPage() {
  const { accessToken } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0])

  const fetchDashboard = async () => {
    if (!accessToken) return
    setLoading(true)
    const res = await fetch(`/api/v1/publisher/dashboard?from=${from}&to=${to}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
    })
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    if (accessToken) fetchDashboard()
  }, [accessToken])

  const inputStyle = {
    border: '1.5px solid #DDD1B8',
    backgroundColor: '#FBF6EC',
    color: '#2A241C',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '14px',
    outline: 'none',
  }

  const cards = data
    ? [
        { label: 'ยอดขายรวม (GMV)', value: `฿${data.myGmv.toLocaleString()}`, color: '#2F5D50' },
        { label: 'ส่วนแบ่งที่ได้รับ (70%)', value: `฿${data.myPublisherShare.toLocaleString()}`, color: '#2F6E54' },
        { label: 'จำนวนหนังสือทั้งหมด', value: data.bookCount.toLocaleString(), color: '#2A241C' },
        { label: 'จำนวนที่ขายได้', value: data.soldCount.toLocaleString(), color: '#C99A3F' },
      ]
    : []

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
        >
          แดชบอร์ด
        </h1>
        <div className="flex items-center gap-2">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inputStyle} />
          <span style={{ color: '#6B6253' }}>—</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={inputStyle} />
          <button
            onClick={fetchDashboard}
            className="px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
          >
            ดูข้อมูล
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: '#DDD1B8' }} />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map(card => (
            <div
              key={card.label}
              className="rounded-xl p-4"
              style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}
            >
              <p className="text-xs mb-1" style={{ color: '#6B6253' }}>{card.label}</p>
              <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center py-8" style={{ color: '#6B6253' }}>ไม่สามารถโหลดข้อมูลได้</p>
      )}
    </div>
  )
}
