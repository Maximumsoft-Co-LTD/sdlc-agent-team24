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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">รายได้</h1>
        <div className="flex items-center gap-2 flex-wrap">
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
            onClick={fetchRevenue}
            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700"
          >
            ดูข้อมูล
          </button>
          <button
            onClick={handleExportCsv}
            className="border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">ไม่มีรายการในช่วงเวลาที่เลือก</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">วันที่</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">หนังสือ</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">ยอดขาย</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">ค่าธรรมเนียม</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">สุทธิ</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">ส่วนแบ่งฉัน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item: any) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: '2-digit',
                        })
                      : '-'}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {item.book?.title || '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    ฿{(item.gross || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-red-500">
                    -฿{(item.gateway_fee || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    ฿{(item.net || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">
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
