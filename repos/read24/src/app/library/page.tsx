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
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#EFE6D2' }}>
      <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: '#BF5A2B', borderTopColor: 'transparent' }}></div>
    </div>
  )

  return (
    <div style={{ backgroundColor: '#EFE6D2', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1
          className="text-2xl font-bold mb-6"
          style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
        >
          ชั้นหนังสือของฉัน
        </h1>

        {/* Tab pills */}
        <div className="flex gap-1 p-1 rounded-full w-fit mb-6" style={{ backgroundColor: '#DDD1B8' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={
                activeTab === tab.key
                  ? { backgroundColor: '#2A241C', color: '#EFE6D2' }
                  : { backgroundColor: 'transparent', color: '#6B6253' }
              }
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                  style={
                    activeTab === tab.key
                      ? { backgroundColor: 'rgba(239,230,210,0.2)', color: '#EFE6D2' }
                      : { backgroundColor: 'rgba(42,36,28,0.1)', color: '#5a5142' }
                  }
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16" style={{ color: '#6B6253' }}>
            <p className="text-4xl mb-3">&#128218;</p>
            <p>ยังไม่มีหนังสือ</p>
            <Link
              href="/books"
              className="mt-3 inline-block font-medium"
              style={{ color: '#BF5A2B' }}
            >
              เลือกซื้อหนังสือ
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item: LibraryItem) => (
              <div
                key={item.entitlementId}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{
                  backgroundColor: '#FBF6EC',
                  border: '1px solid #DDD1B8',
                  boxShadow: '0 1px 4px rgba(42,36,28,0.06)',
                }}
              >
                <div
                  className="w-16 h-20 rounded-lg flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: '#3D5A4A' }}
                >
                  {item.book.cover_url && (
                    <img src={item.book.cover_url} className="w-full h-full object-cover" alt="" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-medium truncate"
                    style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
                  >
                    {item.book.title}
                  </h3>
                  <p className="text-sm" style={{ color: '#6B6253' }}>{item.book.author}</p>
                  {activeTab === 'renting' && item.daysLeft !== null && item.daysLeft > 0 && (
                    <div className="mt-1.5">
                      <div
                        className="h-1.5 rounded-full mb-1"
                        style={{ backgroundColor: '#DDD1B8', maxWidth: '120px' }}
                      >
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            backgroundColor: '#BF5A2B',
                            width: `${Math.min(100, (item.daysLeft / 7) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs" style={{ color: '#BF5A2B' }}>
                        เหลืออีก {item.daysLeft} วัน
                      </p>
                    </div>
                  )}
                  {activeTab === 'expired' && (
                    <p className="text-sm mt-1" style={{ color: '#9a4632' }}>หมดอายุแล้ว</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {activeTab === 'expired' ? (
                    <Link
                      href={`/books/${item.book._id}`}
                      className="text-sm px-3 py-1.5 rounded-lg font-medium"
                      style={{ backgroundColor: '#FBF1E2', border: '1.5px solid #BF5A2B', color: '#BF5A2B' }}
                    >
                      เช่าอีกครั้ง
                    </Link>
                  ) : (
                    <Link
                      href={`/read/${item.book._id}`}
                      className="text-sm px-3 py-1.5 rounded-lg font-medium"
                      style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
                    >
                      อ่าน
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
