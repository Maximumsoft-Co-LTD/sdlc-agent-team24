'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

type Tab = 'renting' | 'owned' | 'expired'

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

const COVER_PALETTES: Record<string, { bg: string }> = {
  'นิยาย':      { bg: '#2F5D50' },
  'ไซไฟ':       { bg: '#2C3E63' },
  'สืบสวน':     { bg: '#25303A' },
  'ธุรกิจ':     { bg: '#5B6E86' },
}
function getCoverBg(category?: string) {
  return category && COVER_PALETTES[category] ? COVER_PALETTES[category].bg : '#4A5568'
}

function CoverThumb({ item, size = 80 }: { item: LibraryItem; size?: number }) {
  return (
    <div style={{ width: size, aspectRatio: '2/3', borderRadius: 6, overflow: 'hidden', flexShrink: 0, backgroundColor: getCoverBg() }}>
      {item.book.cover_url
        ? <img src={item.book.cover_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
        : <div style={{ width: '100%', height: '100%', background: '#5B6E86' }} />
      }
    </div>
  )
}

const TAB_DOTS: Record<Tab, string> = {
  renting: '#BF5A2B',
  owned:   '#2F5D50',
  expired: '#8A7F68',
}

export default function LibraryPage() {
  const { user, accessToken, loading: authLoading } = useAuth()
  const [library, setLibrary] = useState<Library>({ owned: [], renting: [], expired: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('renting')
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
    { key: 'renting', label: 'กำลังเช่า', count: library.renting.length },
    { key: 'owned',   label: 'เป็นเจ้าของ', count: library.owned.length },
    { key: 'expired', label: 'หมดอายุ',    count: library.expired.length },
  ]

  const items = library[activeTab] || []

  if (loading || authLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#ECE3D2' }}>
      <div style={{ width: 32, height: 32, border: '4px solid #BF5A2B', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ backgroundColor: '#ECE3D2', minHeight: '100vh' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 22px' }}>
        <h1 style={{ fontFamily: "'Trirong',serif", fontSize: 26, fontWeight: 700, color: '#2A241C', marginBottom: 24 }}>
          ชั้นหนังสือของฉัน
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '9px 18px',
                  borderRadius: 30,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: isActive ? '#2A241C' : 'transparent',
                  color: isActive ? '#FBF6EC' : '#6B6253',
                  fontFamily: "'IBM Plex Sans Thai',system-ui,sans-serif",
                  transition: 'all .12s',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: TAB_DOTS[tab.key], flexShrink: 0 }} />
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    padding: '1px 6px', borderRadius: 30,
                    backgroundColor: isActive ? 'rgba(251,246,236,.2)' : 'rgba(42,36,28,.1)',
                    color: isActive ? '#FBF6EC' : '#4A4234',
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#6B6253' }}>
            <p style={{ fontSize: 44, marginBottom: 12 }}>📚</p>
            <p style={{ fontSize: 15, marginBottom: 20 }}>ยังไม่มีหนังสือ</p>
            <Link href="/books" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 10, backgroundColor: '#BF5A2B', color: '#FBF6EC', textDecoration: 'none', fontWeight: 600 }}>
              เลือกซื้อหนังสือ
            </Link>
          </div>
        ) : (
          <>
            {/* RENTING — horizontal cards with progress */}
            {activeTab === 'renting' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.map(item => (
                  <div
                    key={item.entitlementId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '14px 16px',
                      borderRadius: 14,
                      backgroundColor: '#FBF6EC',
                      border: '1px solid #E0D5BE',
                      boxShadow: '0 1px 4px rgba(42,36,28,.06)',
                    }}
                  >
                    <CoverThumb item={item} size={80} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontFamily: "'Trirong',serif", fontSize: 16, fontWeight: 600, color: '#2A241C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                        {item.book.title}
                      </h3>
                      <p style={{ fontSize: 13, color: '#6B6253', marginBottom: 10 }}>{item.book.author}</p>
                      {item.daysLeft !== null && item.daysLeft > 0 && (
                        <>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#BF5A2B', backgroundColor: '#F7E4D5', borderRadius: 30, padding: '3px 10px', marginBottom: 8 }}>
                            ⏳ เหลือ {item.daysLeft} วัน
                          </span>
                          <div style={{ height: 5, borderRadius: 99, backgroundColor: '#E0D5BE', maxWidth: 140 }}>
                            <div style={{ height: '100%', borderRadius: 99, backgroundColor: '#BF5A2B', width: `${Math.min(100, (item.daysLeft / 7) * 100)}%` }} />
                          </div>
                        </>
                      )}
                      {item.daysLeft !== null && item.daysLeft <= 0 && (
                        <p style={{ fontSize: 13, color: '#9A4632' }}>หมดอายุแล้ว</p>
                      )}
                    </div>
                    <Link
                      href={`/read/${item.book._id}`}
                      style={{ padding: '9px 16px', borderRadius: 8, backgroundColor: '#BF5A2B', color: '#FBF6EC', textDecoration: 'none', fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      อ่านต่อ
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* OWNED — grid with cover and overlay */}
            {activeTab === 'owned' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 16 }}>
                {items.map(item => (
                  <div key={item.entitlementId} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ aspectRatio: '2/3', backgroundColor: '#4A5568' }}>
                      {item.book.cover_url
                        ? <img src={item.book.cover_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        : <div style={{ width: '100%', height: '100%', background: '#5B6E86' }} />
                      }
                    </div>
                    {/* owned badge */}
                    <div style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, fontWeight: 700, color: '#EDF4EF', backgroundColor: '#2F5D50', borderRadius: 20, padding: '2px 8px' }}>
                      เป็นเจ้าของ
                    </div>
                    {/* read overlay */}
                    <Link
                      href={`/read/${item.book._id}`}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(42,36,28,.0)',
                        color: '#FBF6EC',
                        textDecoration: 'none',
                        fontSize: 26,
                        fontWeight: 700,
                        opacity: 0,
                        transition: 'all .15s',
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLAnchorElement
                        el.style.backgroundColor = 'rgba(42,36,28,.65)'
                        el.style.opacity = '1'
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLAnchorElement
                        el.style.backgroundColor = 'rgba(42,36,28,.0)'
                        el.style.opacity = '0'
                      }}
                    >
                      ▸ เปิดอ่าน
                    </Link>
                    <div style={{ padding: '8px 6px' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#2A241C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.book.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* EXPIRED — grayscale + re-rent */}
            {activeTab === 'expired' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.map(item => (
                  <div
                    key={item.entitlementId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '14px 16px',
                      borderRadius: 14,
                      backgroundColor: '#FBF6EC',
                      border: '1px solid #E0D5BE',
                      opacity: .75,
                    }}
                  >
                    <div style={{ width: 64, aspectRatio: '2/3', borderRadius: 6, overflow: 'hidden', flexShrink: 0, filter: 'grayscale(1)', backgroundColor: '#C0BAA8' }}>
                      {item.book.cover_url
                        ? <img src={item.book.cover_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        : <div style={{ width: '100%', height: '100%' }} />
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontFamily: "'Trirong',serif", fontSize: 15, fontWeight: 600, color: '#4A4234', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.book.title}
                      </h3>
                      <p style={{ fontSize: 13, color: '#8A7F68' }}>{item.book.author}</p>
                      <p style={{ fontSize: 12, color: '#9A4632', marginTop: 4 }}>หมดอายุแล้ว</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                      <Link
                        href={`/books/${item.book._id}`}
                        style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: '#F7E4D5', border: '1.5px solid #EAC9B3', color: '#BF5A2B', textDecoration: 'none', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'center' }}
                      >
                        เช่าอีกครั้ง
                      </Link>
                      <Link
                        href={`/books/${item.book._id}`}
                        style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: '#2A241C', color: '#FBF6EC', textDecoration: 'none', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'center' }}
                      >
                        ซื้อ
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
