'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useParams, useSearchParams } from 'next/navigation'

export default function RouteDebug() {
  const pathname = usePathname()
  const params = useParams()
  const qs = useSearchParams()
  const [show, setShow] = useState(false)

  const debugFlag = qs.get('debug') === '1'

  useEffect(() => {
    const host =
      typeof window !== 'undefined' ? window.location.hostname : ''
    const isLocal =
      host === 'localhost' || host === '127.0.0.1' || host === '::1'
    const isDev = process.env.NODE_ENV !== 'production'
    setShow(isLocal || isDev || debugFlag)
  }, [debugFlag])

  const paramJson = useMemo(() => {
    try {
      return JSON.stringify(params ?? {}, null, 2)
    } catch {
      return '{}'
    }
  }, [params])

  if (!show) return null

  return (
    <div className="fixed left-3 bottom-3 z-[9999] max-w-[60vw] whitespace-pre-wrap rounded-2xl bg-sky-500 px-3 py-2 text-white shadow-xl text-[12px] leading-[1.3]">
      <div className="mb-1 font-bold">✅ Route Debug</div>
      <div><b>pathname:</b> {pathname}</div>
      <div className="mt-1"><b>params:</b></div>
      <pre className="m-0">{paramJson}</pre>
      <div className="mt-1 opacity-80">
        (배포에선 URL 뒤에 <code>?debug=1</code> 붙이면 표시)
      </div>
    </div>
  )
}
