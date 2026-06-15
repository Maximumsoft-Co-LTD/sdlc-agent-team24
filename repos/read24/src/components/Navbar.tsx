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

  const navLinkClass = (href: string) => {
    const isActive = pathname === href || pathname.startsWith(href + '/')
    return isActive
      ? 'font-medium transition-colors'
      : 'font-medium transition-colors'
  }

  return (
    <nav style={{ backgroundColor: '#2F5D50' }} className="sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-2xl font-bold"
              style={{ fontFamily: "'Trirong', serif", color: '#F3E9D2' }}
            >
              Read24
            </span>
            <span className="text-sm hidden sm:block" style={{ color: '#b3a88f' }}>
              ร้านหนังสือออนไลน์
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-5">
            <Link
              href="/books"
              className="text-sm font-medium transition-colors"
              style={{ color: pathname.startsWith('/books') ? '#F0A878' : '#b3a88f' }}
            >
              หนังสือ
            </Link>

            {!loading && user && (
              <>
                <Link
                  href="/library"
                  className="text-sm font-medium transition-colors"
                  style={{ color: pathname.startsWith('/library') ? '#F0A878' : '#b3a88f' }}
                >
                  ชั้นหนังสือ
                </Link>
                <Link
                  href="/cart"
                  className="relative text-sm font-medium transition-colors"
                  style={{ color: pathname.startsWith('/cart') ? '#F0A878' : '#b3a88f' }}
                >
                  ตะกร้า
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-2 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center" style={{ backgroundColor: '#BF5A2B' }}>
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/wallet"
                  className="text-sm font-medium transition-colors"
                  style={{ color: pathname.startsWith('/wallet') ? '#F0A878' : '#D9A441' }}
                >
                  &#x1FA99; {user.balance.toLocaleString()} เหรียญ
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: '#EFE6D2' }}>
                    {user.displayName}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={
                      user.role === 'admin'
                        ? { backgroundColor: 'rgba(191,90,43,0.25)', color: '#F0A878' }
                        : user.role === 'publisher'
                        ? { backgroundColor: 'rgba(47,110,84,0.3)', color: '#9FCBB3' }
                        : { backgroundColor: 'rgba(239,230,210,0.15)', color: '#EFE6D2' }
                    }
                  >
                    {user.role === 'admin' ? 'แอดมิน' : user.role === 'publisher' ? 'สำนักพิมพ์' : 'ผู้อ่าน'}
                  </span>
                  {user.role === 'publisher' && (
                    <Link
                      href="/publisher/books"
                      className="text-sm font-medium"
                      style={{ color: '#9FCBB3' }}
                    >
                      จัดการหนังสือ
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      className="text-sm font-medium"
                      style={{ color: '#F0A878' }}
                    >
                      แอดมิน
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="text-sm transition-colors"
                    style={{ color: '#b3a88f' }}
                  >
                    ออกจากระบบ
                  </button>
                </div>
              </>
            )}

            {!loading && !user && (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors"
                  style={{ color: '#EFE6D2', borderColor: 'rgba(239,230,210,0.4)' }}
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
                  style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
