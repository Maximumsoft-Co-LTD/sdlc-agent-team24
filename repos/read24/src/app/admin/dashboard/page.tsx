'use client'
import { useState, useEffect, lazy, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import dynamic from 'next/dynamic'

const BarChart = dynamic(
  () => import('recharts').then(m => m.BarChart),
  { ssr: false }
)
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const Legend = dynamic(() => import('recharts').then(m => m.Legend), { ssr: false })
const ResponsiveContainer = dynamic(
  () => import('recharts').then(m => m.ResponsiveContainer),
  { ssr: false }
)

interface DashboardData {
  gmv: number
  platformCut: number
  publisherShare: number
  buyCount: number
  rentCount: number
  booksByStatus: {
    published: number
    pendingReview: number
    draft: number
    suspended: number
  }
  revenueByMonth: Array<{ month: string; gmv: number; platformCut: number; publisherShare: number }>
  recentOrders: any[]
  recentAuditLogs: any[]
}

export default function AdminDashboardPage() {
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
    const res = await fetch(`/api/v1/admin/dashboard?from=${from}&to=${to}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
    })
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    if (accessToken) fetchDashboard()
  }, [accessToken])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
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
            onClick={fetchDashboard}
            className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700"
          >
            ดูข้อมูล
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">GMV</p>
              <p className="text-2xl font-bold text-indigo-700">฿{data.gmv.toLocaleString()}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">ส่วนแบ่ง Read24</p>
              <p className="text-2xl font-bold text-red-700">฿{data.platformCut.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">ส่วนแบ่งสำนักพิมพ์</p>
              <p className="text-2xl font-bold text-green-700">฿{data.publisherShare.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">คำสั่งซื้อ</p>
              <p className="text-2xl font-bold text-yellow-700">
                {(data.buyCount + data.rentCount).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">ซื้อ {data.buyCount} | เช่า {data.rentCount}</p>
            </div>
          </div>

          {/* Book status counts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{data.booksByStatus.published}</p>
              <p className="text-xs text-gray-500 mt-1">เผยแพร่แล้ว</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">{data.booksByStatus.pendingReview}</p>
              <p className="text-xs text-gray-500 mt-1">รอรีวิว</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-gray-500">{data.booksByStatus.draft}</p>
              <p className="text-xs text-gray-500 mt-1">ร่าง</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-orange-600">{data.booksByStatus.suspended}</p>
              <p className="text-xs text-gray-500 mt-1">ระงับ</p>
            </div>
          </div>

          {/* Revenue Chart */}
          {data.revenueByMonth.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">รายได้รายเดือน</h2>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.revenueByMonth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: number) => `฿${v.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="gmv" name="GMV" fill="#6366f1" />
                    <Bar dataKey="platformCut" name="Read24" fill="#ef4444" />
                    <Bar dataKey="publisherShare" name="สำนักพิมพ์" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent orders */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h2 className="text-base font-semibold text-gray-800 mb-3">คำสั่งซื้อล่าสุด</h2>
              {data.recentOrders.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">ยังไม่มีคำสั่งซื้อ</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b">
                      <th className="text-left pb-2">รหัส</th>
                      <th className="text-right pb-2">ยอด</th>
                      <th className="text-right pb-2">วันที่</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.recentOrders.map((order: any) => (
                      <tr key={order._id}>
                        <td className="py-1.5 text-gray-600 font-mono">{order._id.slice(-8)}</td>
                        <td className="py-1.5 text-right font-medium">฿{order.total?.toLocaleString() || '-'}</td>
                        <td className="py-1.5 text-right text-gray-400">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h2 className="text-base font-semibold text-gray-800 mb-3">บันทึกการกระทำล่าสุด</h2>
              {data.recentAuditLogs.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">ยังไม่มีบันทึก</p>
              ) : (
                <div className="space-y-2">
                  {data.recentAuditLogs.map((log: any) => (
                    <div key={log._id} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-medium text-gray-700">{log.actor_role}</span>
                        <span className="mx-1 text-gray-400">·</span>
                        <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{log.action}</span>
                      </div>
                      <span className="text-gray-400">
                        {log.created_at
                          ? new Date(log.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
                          : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-center py-8">ไม่สามารถโหลดข้อมูลได้</p>
      )}
    </div>
  )
}
