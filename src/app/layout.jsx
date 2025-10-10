import { Suspense } from 'react'

export const metadata = { title: 'sporttalk', description: 'app' }

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  )
}
