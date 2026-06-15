'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

type Tab = 'owned' | 'renting' | 'expired'

interface LibraryItem {
  entitlementId: string
  book: {
    _id: string
    title: string
    author: string
    cover_url: string | null
  }
  type: string
  status: string
  expiresAt: string | null
  daysLeft: number | null
}

interface Library {
  owned: LibraryItem[]
  renting: LibraryItem[]
  expired: LibraryItem[]
}

export default function LibraryPage() {
  const { user, accessToken, loading: authLoading } = useAuth()
  const [library, setLibrary] = useState<Library>({ owned: [], renting: [], expired: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('owned')
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [authLoading, user, router])

  const fetchLibrary = async () => {
    if (!accessToken) return
    const res = await fetch('/api/v1/me/library', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (res.ok) setLibrary(await res.json())
    setLoading(false)
  }

  useEffect(() => { if (accessToken) fetchLibrary() }, [accessToken])

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'owned', label: 'ซื้อแล้ว', count: library.owned.length },
    { key: 'renting', label: 'กำลังเช่า', count: library.renting.length },
    { key: 'expired', label: 'หมดอายุ', count: library.expired.length },
  ]

  const items = library[activeTab] || []

  if (loading || authLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ชั้นหนังสือของฉัน</h1>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            {tab.label}
            {tab.count > 0 && <span className="ml-1.5 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">{tab.count}</span>}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">📚</p>
          <p>ยังไม่มีหนังสือ</p>
          <Link href="/books" className="mt-3 inline-block text-indigo-600 hover:underline">เลือกซื้อหนังสือ</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: LibraryItem) => (
            <div key={item.entitlementId} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="w-16 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex-shrink-0 overflow-hidden">
                {item.book.cover_url && <img src={item.book.cover_url} className="w-full h-full object-cover" alt="" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{item.book.title}</h3>
                <p className="text-sm text-gray-500">{item.book.author}</p>
                {activeTab === 'renting' && item.daysLeft !== null && item.daysLeft > 0 && (
                  <p className="text-sm text-orange-600 mt-1">เหลืออีก {item.daysLeft} วัน</p>
                )}
                {activeTab === 'expired' && (
                  <p className="text-sm text-red-500 mt-1">หมดอายุแล้ว</p>
                )}
              </div>
              <div className="flex gap-2">
                {activeTab === 'expired' ? (
                  <Link href={`/books/${item.book._id}`} className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">เช่าอีกครั้ง</Link>
                ) : (
                  <Link href={`/read/${item.book._id}`} className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">อ่าน</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
