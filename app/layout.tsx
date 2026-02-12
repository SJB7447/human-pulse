import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import MoodVentilation from '@/components/MoodVentilation'
import Navbar from '@/components/Navbar'
import { MoodProvider } from '@/context/MoodContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://human-pulse.vercel.app'),
  title: {
    template: '%s | Human Pulse',
    default: 'Human Pulse - AI 인터랙티브 뉴스',
  },
  description: '감정으로 경험하는 뉴스. AI 기반 인터랙티브 스토리텔링 플랫폼.',
  openGraph: {
    title: 'Human Pulse',
    description: '생성형 AI 기반 인터랙티브 뉴스 서비스',
    url: '/',
    siteName: 'Human Pulse',
    locale: 'ko_KR',
    type: 'website',
  },
}

import { ToastProvider } from '@/components/ui/Toast'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <MoodProvider>
          <ToastProvider>
            <MoodVentilation />
            <Navbar />
            <main className="min-h-screen bg-gray-50 text-gray-900">
              {children}
            </main>
          </ToastProvider>
        </MoodProvider>
      </body>
    </html>
  )
}
