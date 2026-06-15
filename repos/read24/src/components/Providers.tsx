'use client'

import React from 'react'
import { AuthProvider } from '@/contexts/AuthContext'

/**
 * Client-side context providers wrapper.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
