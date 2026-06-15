'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface PublisherItem {
  id: string
  name: string
  revenue_share: number
  bookCount: number
  totalEarnings: number
}

export default function AdminPublishersPage() {
  const { accessToken } = useAuth()
  const [publishers, setPublishers] = useState<PublisherItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  const fetchPublishers = async () => {
    if (!accessToken) return
    setLoading(true)
    const res = await fetch('/api/v1/admin/publishers', {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
    })
    if (res.ok) {
      const data = await res.json()
      setPublishers(data.items || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (accessToken) fetchPublishers()
  }, [accessToken])

  const handleEdit = (pub: PublisherItem) => {
    setEditing(pub.id)
    setEditValue(String(pub.revenue_share ?? 70))
  }

  const handleSave = async (publisherId: string, publisherName: string) => {
    const newShare = parseFloat(editValue)
    if (isNaN(newShare) || newShare < 0 || newShare > 100) {
      alert('ส่วนแบ่งต้องอยู่ระหว่าง 0-100')
      return
    }
    if (!confirm(`ยืนยันเปลี่ยนส่วนแบ่งของ "${publisherName}" เป็น ${newShare}%?`)) return
    setSaving(publisherId)
    const res = await fetch(`/api/v1/admin/publishers/${publisherId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({ revenue_share: newShare }),
    })
    if (res.ok) {
      setPublishers(prev =>
        prev.map(p => p.id === publisherId ? { ...p, revenue_share: newShare } : p)
      )
      setEditing(null)
    }
    setSaving(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">สำนักพิมพ์</h1>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : publishers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">ยังไม่มีสำนักพิมพ์</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ชื่อสำนักพิมพ์</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">จำนวนหนังสือ</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">รายได้รวม</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">ส่วนแบ่ง %</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {publishers.map(pub => (
                <tr key={pub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{pub.name}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{pub.bookCount}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    ฿{(pub.totalEarnings || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editing === pub.id ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        min="0"
                        max="100"
                        step="1"
                        className="w-20 border border-gray-300 rounded px-2 py-0.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    ) : (
                      <span className="font-medium">{pub.revenue_share ?? 70}%</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editing === pub.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(pub.id, pub.name)}
                          disabled={saving === pub.id}
                          className="text-xs text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded disabled:opacity-50"
                        >
                          {saving === pub.id ? 'บันทึก...' : 'บันทึก'}
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="text-xs text-gray-500 border border-gray-300 px-2 py-1 rounded hover:bg-gray-50"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(pub)}
                        className="text-xs text-indigo-600 border border-indigo-300 px-2 py-1 rounded hover:bg-indigo-50"
                      >
                        แก้ไขส่วนแบ่ง
                      </button>
                    )}
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
