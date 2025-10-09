// src/components/TogglePinButton.jsx
'use client'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function TogglePinButton({ postId, isPinned }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(null) // null=로딩, true/false=결과
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { user } } = await sb.auth.getUser()
      if (!mounted) return
      setUser(user || null)
      if (user) {
        const { data, error } = await sb
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        if (!mounted) return
        if (error) {
          console.error('[profiles select error]', error)
          setIsAdmin(false)
        } else {
          setIsAdmin(!!data?.is_admin)
        }
      } else {
        setIsAdmin(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  async function togglePin() {
    if (!user || !isAdmin || loading) return
    setLoading(true)
    const { error } = await sb.from('posts').update({ is_pinned: !isPinned }).eq('id', postId)
    setLoading(false)
    if (error) {
      alert('고정 상태 변경 실패: ' + error.message)
      console.error(error)
    } else {
      router.refresh()
    }
  }

  // ── 디버그 배지: 현재 상태가 뭔지 항상 보여줌
  const badge =
    isAdmin === null ? '확인 중…' : isAdmin ? '관리자' : '관리자 아님'

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-[10px] md:text-xs px-2 py-0.5 rounded border ${
          isAdmin ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-500'
        }`}
        title={user ? user.id : '로그아웃 상태'}
      >
        {badge}
      </span>

      <button
        onClick={togglePin}
        disabled={!isAdmin || loading}
        className={`text-xs md:text-sm px-3 py-1 rounded-lg border ${
          isPinned
            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isPinned ? '📍 고정 해제하기' : '📌 고정하기'}
      </button>
    </div>
  )
}

