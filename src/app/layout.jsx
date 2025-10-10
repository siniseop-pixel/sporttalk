// src/app/layout.jsx
import { Suspense } from 'react'

export const metadata = {
  title: 'sporttalk',
  description: 'app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        {/* 모든 라우트를 전역 Suspense로 감싸 CSR 훅 에러를 차단 */}
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </body>
    </html>
  )
}
