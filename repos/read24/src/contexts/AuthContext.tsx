'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  displayName: string
  role: 'reader' | 'publisher' | 'admin'
  balance: number
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<string | null>
  updateBalance: (balance: number) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshToken = async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/v1/auth/refresh', { method: 'POST', credentials: 'include' })
      if (!res.ok) return null
      const data = await res.json()
      setAccessToken(data.accessToken)
      return data.accessToken
    } catch {
      return null
    }
  }

  useEffect(() => {
    // Try to restore session on mount
    refreshToken().then(async (token) => {
      if (token) {
        const meRes = await fetch('/api/v1/me', { headers: { Authorization: `Bearer ${token}` } })
        if (meRes.ok) {
          const me = await meRes.json()
          setUser(me)
        }
      }
      setLoading(false)
    })
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'LOGIN_FAILED')
    }
    const data = await res.json()
    setAccessToken(data.accessToken)
    // Fetch full user with balance from /api/v1/me
    const meRes = await fetch('/api/v1/me', {
      headers: { Authorization: `Bearer ${data.accessToken}` },
    })
    if (meRes.ok) {
      const me = await meRes.json()
      setUser(me)
    } else {
      setUser({ ...data.user, balance: 0 })
    }
  }

  const logout = () => {
    setAccessToken(null)
    setUser(null)
    document.cookie = 'refreshToken=; Max-Age=0; path=/'
  }

  const updateBalance = (balance: number) => {
    setUser(prev => prev ? { ...prev, balance } : null)
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout, refreshToken, updateBalance }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
