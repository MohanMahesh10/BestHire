import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BestHire - AI Recruitment Platform',
  description: 'AI-powered recruitment platform for parsing resumes and matching candidates',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Navigation />
        <main className="container mx-auto px-4 py-4 md:py-8 max-w-7xl flex-1">
          {children}
        </main>
        <footer className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-6 mt-auto border-t border-white/20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm font-medium">
              © 2025 BestHire. Developed by <span className="font-bold">MOHAN MAHESH</span>. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
