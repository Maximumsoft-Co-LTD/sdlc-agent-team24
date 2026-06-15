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
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
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
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
      >
        สำนักพิมพ์
      </h1>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: '#DDD1B8' }} />
          ))}
        </div>
      ) : publishers.length === 0 ? (
        <div
          className="text-center py-16 rounded-xl"
          style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}
        >
          <p style={{ color: '#6B6253' }}>ยังไม่มีสำนักพิมพ์</p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-x-auto"
          style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}
        >
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: '#EFE6D2', borderBottom: '1px solid #DDD1B8' }}>
              <tr>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>ชื่อสำนักพิมพ์</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>จำนวนหนังสือ</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>รายได้รวม</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>ส่วนแบ่ง %</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#5a5142' }}>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {publishers.map(pub => (
                <tr key={pub.id} style={{ borderBottom: '1px solid rgba(221,209,184,0.5)' }}>
                  <td className="px-4 py-3 font-medium" style={{ color: '#2A241C' }}>{pub.name}</td>
                  <td className="px-4 py-3 text-right" style={{ color: '#5a5142' }}>{pub.bookCount}</td>
                  <td className="px-4 py-3 text-right" style={{ color: '#5a5142' }}>
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
                        className="w-20 rounded px-2 py-0.5 text-sm text-right focus:outline-none"
                        style={{ border: '1.5px solid #BF5A2B', backgroundColor: '#FBF1E2', color: '#2A241C' }}
                      />
                    ) : (
                      <span className="font-medium" style={{ color: '#2F6E54' }}>
                        {pub.revenue_share ?? 70}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editing === pub.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(pub.id, pub.name)}
                          disabled={saving === pub.id}
                          className="text-xs px-2 py-1 rounded font-medium disabled:opacity-50"
                          style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
                        >
                          {saving === pub.id ? 'บันทึก...' : 'บันทึก'}
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="text-xs px-2 py-1 rounded"
                          style={{ border: '1px solid #DDD1B8', color: '#5a5142', backgroundColor: '#EFE6D2' }}
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(pub)}
                        className="text-xs px-2 py-1 rounded"
                        style={{ border: '1px solid #2F6E54', color: '#2F6E54', backgroundColor: '#E0EFE7' }}
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
