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

  return (
    <div style={{ backgroundColor: '#EFE6D2', minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
          >
            กระเป๋าเหรียญ
          </h1>
          <Link
            href="/wallet/topup"
            className="px-4 py-2 rounded-lg font-medium text-sm"
            style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
          >
            + เติมเหรียญ
          </Link>
        </div>

        {/* Balance card */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: '#2F5D50' }}
        >
          <p className="text-sm mb-1" style={{ color: '#b3a88f' }}>ยอดเหรียญปัจจุบัน</p>
          <p className="text-4xl font-bold" style={{ color: '#D9A441' }}>
            &#x1FA99; {(user?.balance || 0).toLocaleString()}
          </p>
          <p className="text-sm mt-2" style={{ color: '#b3a88f' }}>เหรียญ</p>
        </div>

        <h2 className="text-lg font-semibold mb-3" style={{ color: '#2A241C' }}>
          ประวัติการทำรายการ
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: '#DDD1B8' }} />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-center py-8" style={{ color: '#6B6253' }}>ยังไม่มีรายการ</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx: any) => (
              <div
                key={tx._id}
                className="flex items-center justify-between p-4 rounded-xl"
                style={{
                  backgroundColor: '#FBF6EC',
                  border: '1px solid #DDD1B8',
                  boxShadow: '0 1px 3px rgba(42,36,28,0.05)',
                }}
              >
                <div>
                  <p className="font-medium" style={{ color: '#2A241C' }}>
                    {typeLabel[tx.type] || tx.type}
                  </p>
                  <p className="text-xs" style={{ color: '#6B6253' }}>
                    {new Date(tx.created_at).toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: tx.amount > 0 ? '#2F6E54' : '#BF5A2B' }}>
                    {tx.amount > 0 ? '+' : ''}
                    {tx.amount.toLocaleString()} &#x1FA99;
                  </p>
                  <p className="text-xs" style={{ color: '#6B6253' }}>
                    คงเหลือ {tx.balance_after?.toLocaleString() || '-'}
                  </p>
                </div>
              </div>
            ))}
            {nextCursor && (
              <button
                onClick={() => fetchTransactions(nextCursor)}
                className="w-full py-2 text-sm font-medium"
                style={{ color: '#BF5A2B' }}
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
