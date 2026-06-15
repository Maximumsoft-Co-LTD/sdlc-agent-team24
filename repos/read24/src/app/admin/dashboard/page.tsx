'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import dynamic from 'next/dynamic'

const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const Legend = dynamic(() => import('recharts').then(m => m.Legend), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })

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
          แดชบอร์ด
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: '#DDD1B8' }} />
          ))}
        </div>
      ) : data ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-xl p-4" style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}>
              <p className="text-xs mb-1" style={{ color: '#6B6253' }}>GMV</p>
              <p className="text-2xl font-bold" style={{ color: '#2F5D50' }}>฿{data.gmv.toLocaleString()}</p>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}>
              <p className="text-xs mb-1" style={{ color: '#6B6253' }}>ส่วนแบ่ง Read24</p>
              <p className="text-2xl font-bold" style={{ color: '#BF5A2B' }}>฿{data.platformCut.toLocaleString()}</p>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}>
              <p className="text-xs mb-1" style={{ color: '#6B6253' }}>ส่วนแบ่งสำนักพิมพ์</p>
              <p className="text-2xl font-bold" style={{ color: '#2F6E54' }}>฿{data.publisherShare.toLocaleString()}</p>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}>
              <p className="text-xs mb-1" style={{ color: '#6B6253' }}>คำสั่งซื้อ</p>
              <p className="text-2xl font-bold" style={{ color: '#C99A3F' }}>
                {(data.buyCount + data.rentCount).toLocaleString()}
              </p>
              <p className="text-xs" style={{ color: '#6B6253' }}>
                ซื้อ {data.buyCount} | เช่า {data.rentCount}
              </p>
            </div>
          </div>

          {/* Book status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { count: data.booksByStatus.published, label: 'เผยแพร่แล้ว', bg: '#E0EFE7', fg: '#2F6E54' },
              { count: data.booksByStatus.pendingReview, label: 'รออนุมัติ', bg: '#FBEFD6', fg: '#8a6a16' },
              { count: data.booksByStatus.draft, label: 'ฉบับร่าง', bg: '#ECEAE2', fg: '#7a7263' },
              { count: data.booksByStatus.suspended, label: 'ระงับ', bg: '#F6E0DA', fg: '#9a4632' },
            ].map(item => (
              <div
                key={item.label}
                className="rounded-xl p-4 text-center"
                style={{ backgroundColor: item.bg }}
              >
                <p className="text-3xl font-bold" style={{ color: item.fg }}>{item.count}</p>
                <p className="text-xs mt-1" style={{ color: item.fg }}>{item.label}</p>
              </div>
            ))}
          </div>

          {/* Revenue chart */}
          {data.revenueByMonth.length > 0 && (
            <div
              className="rounded-xl p-6 mb-6"
              style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}
            >
              <h2 className="text-base font-semibold mb-4" style={{ color: '#2A241C' }}>
                รายได้รายเดือน
              </h2>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.revenueByMonth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DDD1B8" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B6253' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#6B6253' }} />
                    <Tooltip formatter={(v: number) => `฿${v.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="gmv" name="GMV" fill="#2F5D50" />
                    <Bar dataKey="platformCut" name="Read24" fill="#BF5A2B" />
                    <Bar dataKey="publisherShare" name="สำนักพิมพ์" fill="#2F6E54" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent tables */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl p-4" style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}>
              <h2 className="text-base font-semibold mb-3" style={{ color: '#2A241C' }}>คำสั่งซื้อล่าสุด</h2>
              {data.recentOrders.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: '#6B6253' }}>ยังไม่มีคำสั่งซื้อ</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #DDD1B8' }}>
                      <th className="text-left pb-2" style={{ color: '#6B6253' }}>รหัส</th>
                      <th className="text-right pb-2" style={{ color: '#6B6253' }}>ยอด</th>
                      <th className="text-right pb-2" style={{ color: '#6B6253' }}>วันที่</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order: any) => (
                      <tr key={order._id} style={{ borderBottom: '1px solid rgba(221,209,184,0.5)' }}>
                        <td className="py-1.5 font-mono" style={{ color: '#5a5142' }}>{order._id.slice(-8)}</td>
                        <td className="py-1.5 text-right font-medium" style={{ color: '#2A241C' }}>
                          ฿{order.total?.toLocaleString() || '-'}
                        </td>
                        <td className="py-1.5 text-right" style={{ color: '#6B6253' }}>
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

            <div className="rounded-xl p-4" style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}>
              <h2 className="text-base font-semibold mb-3" style={{ color: '#2A241C' }}>บันทึกการกระทำล่าสุด</h2>
              {data.recentAuditLogs.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: '#6B6253' }}>ยังไม่มีบันทึก</p>
              ) : (
                <div className="space-y-2">
                  {data.recentAuditLogs.map((log: any) => (
                    <div key={log._id} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-medium" style={{ color: '#5a5142' }}>{log.actor_role}</span>
                        <span className="mx-1" style={{ color: '#b3a88f' }}>·</span>
                        <span
                          className="px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: 'rgba(47,93,80,0.12)', color: '#2F5D50' }}
                        >
                          {log.action}
                        </span>
                      </div>
                      <span style={{ color: '#6B6253' }}>
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
        <p className="text-center py-8" style={{ color: '#6B6253' }}>ไม่สามารถโหลดข้อมูลได้</p>
      )}
    </div>
  )
}
