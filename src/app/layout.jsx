import './globals.css'
import { Suspense } from 'react'

export const metadata = { title: 'Sporttalk', description: 'Community' }

function Nav() {
  return (
    <header className="border-b bg-white">
      <nav className="max-w-5xl mx-auto p-3 flex items-center gap-4">
        <a href="/" className="font-bold"> Sporttalk</a>
        <a href="/boards" className="text-sm text-gray-700">Boards</a>
        <span className="flex-1" />
        <a href="/auth/signup" className="text-sm">Sign up</a>
        <a href="/auth/login" className="text-sm">Log in</a>
      </nav>
    </header>
  )
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900">
        <Nav />
        <Suspense fallback={null}>
          <main className="max-w-5xl mx-auto p-4 md:p-6">{children}</main>
        </Suspense>
      </body>
    </html>
  )
}
