import type { Metadata } from 'next'
import { Noto_Sans_Thai } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-sans-thai',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Read24 — Thai E-Book Marketplace',
  description: 'ซื้อและอ่าน e-book ภาษาไทยได้ทุกที่ทุกเวลา',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className={notoSansThai.variable}>
      <body className="font-sans bg-white text-gray-900 min-h-screen">
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
