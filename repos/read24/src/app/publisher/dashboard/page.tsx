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
    const res = await fetch(
      `/api/v1/publisher/dashboard?from=${from}&to=${to}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: 'include',
      }
    )
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    if (accessToken) fetchDashboard()
  }, [accessToken])

  const cards = data
    ? [
        {
          label: 'ยอดขายรวม (GMV)',
          value: `฿${data.myGmv.toLocaleString()}`,
          color: 'bg-indigo-50 border-indigo-200',
          textColor: 'text-indigo-700',
        },
        {
          label: 'ส่วนแบ่งที่ได้รับ (70%)',
          value: `฿${data.myPublisherShare.toLocaleString()}`,
          color: 'bg-green-50 border-green-200',
          textColor: 'text-green-700',
        },
        {
          label: 'จำนวนหนังสือทั้งหมด',
          value: data.bookCount.toLocaleString(),
          color: 'bg-purple-50 border-purple-200',
          textColor: 'text-purple-700',
        },
        {
          label: 'จำนวนที่ขายได้',
          value: data.soldCount.toLocaleString(),
          color: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-700',
        },
      ]
    : []

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-gray-400">—</span>
          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={fetchDashboard}
            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700"
          >
            ดูข้อมูล
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map(card => (
            <div
              key={card.label}
              className={`rounded-xl border p-4 ${card.color}`}
            >
              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">ไม่สามารถโหลดข้อมูลได้</p>
      )}
    </div>
  )
}
