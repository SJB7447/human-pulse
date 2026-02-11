import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import MoodVentilation from '@/components/MoodVentilation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Human Pulse',
  description: 'Generative AI-based Interactive News Service',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MoodVentilation />
        <main className="min-h-screen bg-gray-50 text-gray-900">
          {children}
        </main>
      </body>
    </html>
  )
}
