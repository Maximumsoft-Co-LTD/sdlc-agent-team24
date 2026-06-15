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
      // placeholder — cart count can be wired when cart API is ready
    }
  }, [user, pathname])

  // Avatar initials helper
  const initials = user
    ? user.displayName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : ''

  return (
    <nav
      style={{
        backgroundColor: '#FBF6EC',
        borderBottom: '1px solid #E0D5BE',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 70,
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '0 22px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: "'Trirong', serif",
            fontSize: 22,
            fontWeight: 700,
            color: '#2A241C',
            textDecoration: 'none',
            flexShrink: 0,
            letterSpacing: '-0.01em',
          }}
        >
          Read24•
        </Link>

        {/* Right-side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', flexShrink: 0 }}>
          {/* Coin balance pill — logged in only */}
          {!loading && user && (
            <Link
              href="/wallet"
              style={{
                backgroundColor: '#FBEFD6',
                color: '#7A5A16',
                borderRadius: 30,
                padding: '5px 12px',
                fontSize: 13.5,
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              🪙 {(user.balance || 0).toLocaleString()}
            </Link>
          )}

          {/* Shelf button */}
          {!loading && user && (
            <Link
              href="/library"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                color: '#4A4234',
                textDecoration: 'none',
                fontSize: 13.5,
                fontWeight: 500,
                padding: '6px 10px',
                borderRadius: 8,
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              ชั้นหนังสือ
            </Link>
          )}

          {/* Cart button */}
          {!loading && user && (
            <Link
              href="/cart"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                color: '#4A4234',
                textDecoration: 'none',
                fontSize: 13.5,
                fontWeight: 500,
                padding: '6px 10px',
                borderRadius: 8,
                position: 'relative',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              ตะกร้า
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    backgroundColor: '#BF5A2B',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 16,
                    height: 16,
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Auth buttons or avatar */}
          {!loading && !user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link
                href="/login"
                style={{
                  fontSize: 13.5,
                  fontWeight: 500,
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: '1.5px solid #2A241C',
                  color: '#2A241C',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  padding: '7px 14px',
                  borderRadius: 8,
                  backgroundColor: '#BF5A2B',
                  color: '#FBF6EC',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                สมัครสมาชิก
              </Link>
            </div>
          )}

          {!loading && user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Role shortcuts */}
              {user.role === 'publisher' && (
                <Link
                  href="/publisher/books"
                  style={{ fontSize: 12.5, color: '#2F5D50', textDecoration: 'none', fontWeight: 500 }}
                >
                  จัดการหนังสือ
                </Link>
              )}
              {user.role === 'admin' && (
                <Link
                  href="/admin/dashboard"
                  style={{ fontSize: 12.5, color: '#BF5A2B', textDecoration: 'none', fontWeight: 500 }}
                >
                  แอดมิน
                </Link>
              )}
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    backgroundColor: '#2F5D50',
                    color: '#F3E9D2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                    cursor: 'default',
                  }}
                  title={user.displayName}
                >
                  {initials}
                </div>
                <button
                  onClick={logout}
                  style={{
                    fontSize: 12.5,
                    color: '#8A7F68',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: "'IBM Plex Sans Thai', system-ui, sans-serif",
                  }}
                >
                  ออก
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
