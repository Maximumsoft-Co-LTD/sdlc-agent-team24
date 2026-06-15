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
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="inline-flex px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          แอดมิน
        </span>
        <h1 className="text-lg font-bold text-gray-800">Read24 Admin Panel</h1>
      </div>
      <div className="flex gap-6 mb-6 border-b border-gray-200 overflow-x-auto">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              pathname === link.href
                ? 'text-red-600 border-red-600'
                : 'text-gray-600 hover:text-red-600 border-transparent hover:border-red-600'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  )
}
