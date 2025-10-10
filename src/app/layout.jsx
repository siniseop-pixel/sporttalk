import './globals.css'
import { Suspense } from 'react'
import ClientNav from '@/components/ClientNav.jsx'

export const metadata = {
  title: 'Sporttalk',
  description: 'Community',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900">
        <ClientNav />
        <Suspense fallback={null}>
          <main className="max-w-5xl mx-auto p-4 md:p-6">
            {children}
          </main>
        </Suspense>
      </body>
    </html>
  )
}
