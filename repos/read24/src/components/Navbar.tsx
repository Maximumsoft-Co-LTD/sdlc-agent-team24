'use client'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { user, logout, loading } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const pathname = usePathname()

  // Fetch cart count when authenticated
  useEffect(() => {
    if (user) {
      // Will be implemented when cart API is ready
    }
  }, [user, pathname])

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-indigo-600">Read24</span>
            <span className="text-sm text-gray-500 hidden sm:block">ร้านหนังสือออนไลน์</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/books" className="text-gray-700 hover:text-indigo-600 font-medium">หนังสือ</Link>

            {!loading && user && (
              <>
                <Link href="/library" className="text-gray-700 hover:text-indigo-600 font-medium">ชั้นหนังสือ</Link>
                <Link href="/cart" className="relative text-gray-700 hover:text-indigo-600 font-medium">
                  ตะกร้า
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>
                  )}
                </Link>
                <Link href="/wallet" className="text-gray-700 hover:text-indigo-600 font-medium">
                  🪙 {user.balance.toLocaleString()} เหรียญ
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">{user.displayName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-700' : user.role === 'publisher' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {user.role === 'admin' ? 'แอดมิน' : user.role === 'publisher' ? 'สำนักพิมพ์' : 'ผู้อ่าน'}
                  </span>
                  {user.role === 'publisher' && <Link href="/publisher/books" className="text-sm text-blue-600 hover:underline">จัดการหนังสือ</Link>}
                  {user.role === 'admin' && <Link href="/admin/dashboard" className="text-sm text-red-600 hover:underline">แอดมิน</Link>}
                  <button onClick={logout} className="text-sm text-gray-500 hover:text-red-600">ออกจากระบบ</button>
                </div>
              </>
            )}

            {!loading && !user && (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-gray-700 hover:text-indigo-600 font-medium">เข้าสู่ระบบ</Link>
                <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium">สมัครสมาชิก</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
