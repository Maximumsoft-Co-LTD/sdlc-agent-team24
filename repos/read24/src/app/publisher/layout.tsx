'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function PublisherLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'publisher')) {
      router.push(user ? '/books' : '/login')
    }
  }, [loading, user])

  if (loading) return null

  const navLinks = [
    { href: '/publisher/books', label: 'หนังสือของฉัน' },
    { href: '/publisher/dashboard', label: 'แดชบอร์ด' },
    { href: '/publisher/revenue', label: 'รายได้' },
  ]

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#EFE6D2' }}>
      {/* Sidebar */}
      <aside
        className="w-52 flex-shrink-0 flex flex-col py-6 px-4"
        style={{ backgroundColor: '#1E3329', minHeight: '100vh' }}
      >
        <div className="mb-6 px-2">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(47,110,84,0.35)', color: '#9FCBB3' }}
          >
            สำนักพิมพ์
          </span>
          <p
            className="mt-2 font-bold"
            style={{ fontFamily: "'Trirong', serif", color: '#EDF4EF' }}
          >
            Publisher Hub
          </p>
        </div>
        <nav className="flex flex-col gap-1">
          {navLinks.map(link => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={
                  isActive
                    ? { backgroundColor: 'rgba(159,203,179,0.20)', color: '#EDF4EF' }
                    : { backgroundColor: 'transparent', color: '#9FCBB3' }
                }
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        {children}
      </div>
    </div>
  )
}
