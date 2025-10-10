'use client'

import {useEffect, useMemo, useState} from 'react'
import {usePathname, useParams, useSearchParams} from 'next/navigation'

/**
 * 화면 좌하단에 현재 경로/파라미터를 표시하는 디버그 배너.
 * - 로컬(localhost)에서는 항상 보임
 * - 배포 환경에서는 URL에 ?debug=1 붙였을 때만 보임
 */
export default function RouteDebug() {
  const pathname = usePathname()
  const params = useParams()
  const qs = useSearchParams()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    const force = qs.get('debug') === '1'
    setShow(onLocal || force)
  }, [qs])

  const paramJson = useMemo(() => {
    try { return JSON.stringify(params ?? {}, null, 2) }
    catch { return '{}' }
  }, [params])

  if (!show) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: 12,
        bottom: 12,
        zIndex: 9999,
        background: '#0ea5e9',
        color: 'white',
        padding: '8px 10px',
        borderRadius: 12,
        boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
        fontSize: 12,
        maxWidth: '60vw',
        lineHeight: 1.3,
        whiteSpace: 'pre-wrap'
      }}
    >
      <div style={{fontWeight: 700, marginBottom: 4}}>✅ Route Debug</div>
      <div><b>pathname:</b> {pathname}</div>
      <div style={{marginTop: 4}}><b>params:</b></div>
      <pre style={{margin: 0}}>{paramJson}</pre>
      <div style={{opacity: 0.8, marginTop: 6}}>
        (배포에선 URL 뒤에 <code>?debug=1</code> 붙이면 표시)
      </div>
    </div>
  )
}
