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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">รายได้</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <span className="text-gray-400">—</span>
          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={fetchRevenue}
            className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700"
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : summary ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">GMV</p>
              <p className="text-xl font-bold text-indigo-700">฿{summary.gmv.toLocaleString()}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">ค่าธรรมเนียม</p>
              <p className="text-xl font-bold text-red-700">฿{summary.gatewayFee.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">สุทธิ</p>
              <p className="text-xl font-bold text-gray-700">฿{summary.net.toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Read24 ได้</p>
              <p className="text-xl font-bold text-purple-700">฿{summary.platformCut.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">สำนักพิมพ์ได้</p>
              <p className="text-xl font-bold text-green-700">฿{summary.publisherShare.toLocaleString()}</p>
            </div>
          </div>

          {/* By publisher table */}
          {byPublisher.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500">ไม่มีข้อมูลในช่วงเวลาที่เลือก</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <h2 className="text-sm font-semibold text-gray-600 px-4 py-3 border-b border-gray-100">
                แยกตามสำนักพิมพ์
              </h2>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">สำนักพิมพ์</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">GMV</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">ส่วนแบ่ง</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">รายการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {byPublisher.map(pub => (
                    <tr key={pub.publisherId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {pub.publisherName || pub.publisherId}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        ฿{pub.gmv.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">
                        ฿{pub.publisherShare.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">{pub.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500 text-center py-8">ไม่สามารถโหลดข้อมูลได้</p>
      )}
    </div>
  )
}
