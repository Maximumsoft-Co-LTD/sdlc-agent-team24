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
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex gap-6 mb-6 border-b border-gray-200">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              pathname === link.href
                ? 'text-indigo-600 border-indigo-600'
                : 'text-gray-600 hover:text-indigo-600 border-transparent hover:border-indigo-600'
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
