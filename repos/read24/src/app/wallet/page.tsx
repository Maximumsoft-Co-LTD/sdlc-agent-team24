'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function WalletPage() {
  const { user, accessToken, loading: authLoading } = useAuth()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [authLoading, user])

  const fetchTransactions = async (cursor?: string) => {
    if (!accessToken) return
    const url = cursor
      ? `/api/v1/wallet/transactions?cursor=${cursor}`
      : '/api/v1/wallet/transactions'
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
    const data = await res.json()
    if (cursor) setTransactions(prev => [...prev, ...(data.items || [])])
    else setTransactions(data.items || [])
    setNextCursor(data.nextCursor)
    setLoading(false)
  }

  useEffect(() => {
    if (accessToken) fetchTransactions()
  }, [accessToken])

  const typeLabel: Record<string, string> = {
    topup: 'เติมเหรียญ',
    bonus: 'โบนัส',
    spend: 'ใช้เหรียญ',
    refund: 'คืนเหรียญ',
    adjust: 'ปรับยอด',
  }

  const txIcon = (type: string, amount: number) => {
    const isIn = amount > 0
    return (
      <div style={{
        width: 38, height: 38, borderRadius: '50%',
        backgroundColor: isIn ? '#E0EFE7' : '#F6E0DA',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        fontSize: 16,
      }}>
        {isIn ? '↑' : '↓'}
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#ECE3D2', minHeight: '100vh' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Trirong',serif", fontSize: 26, fontWeight: 700, color: '#2A241C' }}>
            กระเป๋าเหรียญ
          </h1>
          <Link
            href="/wallet/topup"
            style={{ padding: '9px 18px', borderRadius: 10, backgroundColor: '#BF5A2B', color: '#FBF6EC', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}
          >
            + เติมเหรียญ
          </Link>
        </div>

        {/* Balance card */}
        <div
          style={{
            background: 'linear-gradient(135deg,#3A2F22,#2A241C)',
            borderRadius: 20,
            padding: '28px 28px 24px',
            marginBottom: 28,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative orb */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(201,154,63,.10)', pointerEvents: 'none' }} />
          <p style={{ fontSize: 13, color: 'rgba(251,246,236,.55)', marginBottom: 14, fontWeight: 500 }}>ยอดเหรียญปัจจุบัน</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #F0CE73, #C99A3F)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, flexShrink: 0,
            }}>
              🪙
            </div>
            <div style={{ fontFamily: "'Trirong',serif", fontSize: 46, fontWeight: 700, color: '#FBF6EC', lineHeight: 1 }}>
              {(user?.balance || 0).toLocaleString()}
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(251,246,236,.5)' }}>1 เหรียญ = 1 บาท</p>
        </div>

        <h2 style={{ fontFamily: "'Trirong',serif", fontSize: 18, fontWeight: 700, color: '#2A241C', marginBottom: 14 }}>
          ประวัติการทำรายการ
        </h2>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 66, borderRadius: 12, backgroundColor: '#DDD1B8' }} />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '48px 0', color: '#6B6253', fontSize: 15 }}>ยังไม่มีรายการ</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {transactions.map((tx: any) => (
              <div
                key={tx._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 12,
                  backgroundColor: '#FBF6EC',
                  border: '1px solid #E0D5BE',
                  boxShadow: '0 1px 3px rgba(42,36,28,.05)',
                }}
              >
                {txIcon(tx.type, tx.amount)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#2A241C' }}>{typeLabel[tx.type] || tx.type}</p>
                  <p style={{ fontSize: 12, color: '#6B6253', marginTop: 2 }}>
                    {new Date(tx.created_at).toLocaleDateString('th-TH', {
                      day: 'numeric', month: 'short', year: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: "'Trirong',serif", fontWeight: 700, fontSize: 16, color: tx.amount > 0 ? '#2F6E54' : '#BF5A2B' }}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} 🪙
                  </p>
                  <p style={{ fontSize: 12, color: '#6B6253', marginTop: 2 }}>
                    คงเหลือ {tx.balance_after?.toLocaleString() || '-'}
                  </p>
                </div>
              </div>
            ))}
            {nextCursor && (
              <button
                onClick={() => fetchTransactions(nextCursor)}
                style={{ width: '100%', padding: '10px 0', fontSize: 14, fontWeight: 500, color: '#BF5A2B', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'IBM Plex Sans Thai',system-ui,sans-serif" }}
              >
                โหลดเพิ่มเติม
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
