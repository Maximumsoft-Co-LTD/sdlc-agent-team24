'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push(user ? '/books' : '/login')
    }
  }, [loading, user])

  if (loading) return null

  const navLinks = [
    { href: '/admin/dashboard', label: 'แดชบอร์ด' },
    { href: '/admin/books', label: 'จัดการหนังสือ' },
    { href: '/admin/publishers', label: 'สำนักพิมพ์' },
    { href: '/admin/revenue', label: 'รายได้' },
    { href: '/admin/audit-logs', label: 'บันทึกการกระทำ' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#EEECE4' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 224,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
          backgroundColor: '#1E3329',
          minHeight: '100vh',
        }}
      >
        <div style={{ marginBottom: 24, padding: '0 8px' }}>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 30,
            backgroundColor: 'rgba(191,90,43,0.3)',
            color: '#F0A878',
          }}>
            แอดมิน
          </span>
          <p style={{
            marginTop: 8,
            fontFamily: "'Trirong',serif",
            fontWeight: 700,
            fontSize: 15,
            color: '#EDF4EF',
          }}>
            Read24 Admin
          </p>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navLinks.map(link => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '9px 12px',
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all .12s',
                  backgroundColor: isActive ? 'rgba(159,203,179,.20)' : 'transparent',
                  color: isActive ? '#EDF4EF' : '#93A99E',
                  fontFamily: "'IBM Plex Sans Thai',system-ui,sans-serif",
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Topbar */}
        <div style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #E2DECE',
          padding: '0 24px',
          height: 54,
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <p style={{ fontSize: 13.5, color: '#6B6253' }}>
            {user?.displayName} <span style={{ color: '#DDD1B8' }}>·</span> <span style={{ color: '#BF5A2B' }}>Admin</span>
          </p>
        </div>
        <div style={{ flex: 1, padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
