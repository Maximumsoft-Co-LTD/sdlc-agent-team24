'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function WalletPage() {
  const { user, accessToken, loading: authLoading, updateBalance } = useAuth()
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">กระเป๋าเหรียญ</h1>
        <Link
          href="/wallet/topup"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
        >
          + เติมเหรียญ
        </Link>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl p-6 mb-6">
        <p className="text-indigo-200 text-sm mb-1">ยอดเหรียญปัจจุบัน</p>
        <p className="text-4xl font-bold">🪙 {(user?.balance || 0).toLocaleString()}</p>
        <p className="text-indigo-200 text-sm mt-2">เหรียญ</p>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">ประวัติการทำรายการ</h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">ยังไม่มีรายการ</p>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx: any) => (
            <div
              key={tx._id}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
            >
              <div>
                <p className="font-medium text-gray-900">{typeLabel[tx.type] || tx.type}</p>
                <p className="text-xs text-gray-500">
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
                <p className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.amount > 0 ? '+' : ''}
                  {tx.amount.toLocaleString()} 🪙
                </p>
                <p className="text-xs text-gray-400">
                  คงเหลือ {tx.balance_after?.toLocaleString() || '-'}
                </p>
              </div>
            </div>
          ))}
          {nextCursor && (
            <button
              onClick={() => fetchTransactions(nextCursor)}
              className="w-full text-indigo-600 py-2 text-sm hover:underline"
            >
              โหลดเพิ่มเติม
            </button>
          )}
        </div>
      )}
    </div>
  )
}
