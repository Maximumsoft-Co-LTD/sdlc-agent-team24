'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function ReaderPage() {
  const params = useParams()
  const bookId = params.bookId as string
  const { accessToken, user, loading: authLoading } = useAuth()
  const bookRef = useRef<unknown>(null)
  const renditionRef = useRef<{
    display: (cfi?: string) => Promise<void>
    prev: () => void
    next: () => void
    themes: { fontSize: (size: string) => void; font: (font: string) => void }
    on: (event: string, cb: (location: unknown) => void) => void
    destroy?: () => void
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showToc, setShowToc] = useState(false)
  const [toc, setToc] = useState<{ label: string; href: string }[]>([])
  const [progress, setProgress] = useState(0)
  const [fontSize, setFontSize] = useState(16)
  const readerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const getContentUrl = async (token: string): Promise<string> => {
    const res = await fetch(`/api/v1/books/${bookId}/content-url`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'FETCH_ERROR')
    }
    const { url } = await res.json()
    return url
  }

  const saveProgress = useCallback(async (cfi: string, percent: number) => {
    if (!accessToken) return
    await fetch(`/api/v1/me/progress/${bookId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ cfi, percent }),
    })
  }, [accessToken, bookId])

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    if (!accessToken) return

    let cleanup = () => {}

    const initReader = async () => {
      try {
        setLoading(true)
        const epubUrl = await getContentUrl(accessToken)

        // Dynamic import epub.js
        const ePub = (await import('epubjs')).default

        if (!readerRef.current) return

        const book = ePub(epubUrl)
        bookRef.current = book

        const rendition = book.renderTo(readerRef.current, {
          width: '100%',
          height: '100%',
          flow: 'paginated',
          spread: 'none',
        })
        renditionRef.current = rendition

        rendition.themes.fontSize(`${fontSize}px`)
        rendition.themes.font('Noto Sans Thai, sans-serif')

        // Load saved progress
        const progressRes = await fetch(`/api/v1/me/progress/${bookId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const savedProgress = progressRes.ok ? await progressRes.json() : null

        if (savedProgress?.cfi) {
          await rendition.display(savedProgress.cfi)
        } else {
          await rendition.display()
        }

        // TOC
        (book as { loaded: { navigation: Promise<{ toc: { label: string; href: string }[] }> } })
          .loaded.navigation.then((nav) => {
            setToc(nav.toc || [])
          })

        // Progress tracking with debounce
        let progressTimer: ReturnType<typeof setTimeout>
        rendition.on('relocated', (location: unknown) => {
          const loc = location as { start: { percentage?: number; cfi: string } }
          const pct = Math.round((loc.start.percentage || 0) * 100)
          setProgress(pct)
          clearTimeout(progressTimer)
          progressTimer = setTimeout(() => {
            saveProgress(loc.start.cfi, pct)
          }, 1000)
        })

        setLoading(false)

        cleanup = () => {
          clearTimeout(progressTimer)
          if (renditionRef.current?.destroy) renditionRef.current.destroy()
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'LOAD_ERROR'
        if (msg === 'NO_ENTITLEMENT' || msg === 'EXPIRED_ENTITLEMENT') {
          setError(msg)
        } else {
          setError('LOAD_ERROR')
        }
        setLoading(false)
      }
    }

    initReader()
    return () => cleanup()
  }, [authLoading, user, accessToken])

  useEffect(() => {
    if (renditionRef.current) {
      renditionRef.current.themes.fontSize(`${fontSize}px`)
    }
  }, [fontSize])

  if (authLoading || loading) return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-gray-500">กำลังโหลดหนังสือ...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="fixed inset-0 bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-3">⚠️</p>
        <h2 className="text-xl font-bold mb-2">
          {error === 'EXPIRED_ENTITLEMENT' ? 'สิทธิ์เช่าหมดอายุ' : 'ไม่มีสิทธิ์อ่าน'}
        </h2>
        <p className="text-gray-600 mb-6">
          {error === 'EXPIRED_ENTITLEMENT' ? 'การเช่าหนังสือเล่มนี้หมดอายุแล้ว' : 'คุณยังไม่ได้ซื้อหรือเช่าหนังสือเล่มนี้'}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => router.push(`/books/${bookId}`)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">เช่า/ซื้อ</button>
          <button onClick={() => router.push('/library')} className="border border-gray-300 px-4 py-2 rounded-lg">ชั้นหนังสือ</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Reader toolbar */}
      <div className="bg-gray-800 text-white flex items-center gap-4 px-4 py-2 text-sm flex-shrink-0">
        <button onClick={() => router.back()} className="text-gray-300 hover:text-white">← กลับ</button>
        <button onClick={() => setShowToc(!showToc)} className="text-gray-300 hover:text-white">สารบัญ</button>
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="text-gray-300 hover:text-white px-2">A-</button>
          <span className="text-gray-400">{fontSize}px</span>
          <button onClick={() => setFontSize(s => Math.min(28, s + 2))} className="text-gray-300 hover:text-white px-2">A+</button>
          <span className="text-gray-400 ml-2">{progress}%</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* TOC sidebar */}
        {showToc && (
          <div className="w-64 bg-gray-800 text-white overflow-y-auto flex-shrink-0">
            <div className="p-3 font-medium border-b border-gray-700">สารบัญ</div>
            {toc.map((item, i) => (
              <button key={i} onClick={() => { renditionRef.current?.display(item.href); setShowToc(false) }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Reader content */}
        <div className="flex-1 flex items-center">
          <button onClick={() => renditionRef.current?.prev()}
            className="text-white/60 hover:text-white px-3 py-8 flex-shrink-0 text-2xl">‹</button>
          <div ref={readerRef} className="flex-1 h-full bg-white" />
          <button onClick={() => renditionRef.current?.next()}
            className="text-white/60 hover:text-white px-3 py-8 flex-shrink-0 text-2xl">›</button>
        </div>
      </div>
    </div>
  )
}
