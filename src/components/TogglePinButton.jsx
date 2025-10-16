// src/components/TogglePinButton.jsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient.js'

export default function TogglePinButton({ postId, isPinned }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(null) // null=로딩
  const [loading, setLoading] = useState(false)
  const [pinned, setPinned] = useState(!!isPinned) // ✅ 로컬 상태로 현재 고정여부 관리

  useEffect(() => {
    let alive = true

    async function load() {
      const { data } = await supabase.auth.getUser()
      if (!alive) return
      setUser(data?.user ?? null)

      if (data?.user) {
        const { data: prof, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.user.id)
          .single()

        if (!alive) return
        setIsAdmin(error ? false : !!prof?.is_admin)
      } else {
        setIsAdmin(false)
      }
    }

    load()

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => setIsAdmin(error ? false : !!data?.is_admin))
      } else {
        setIsAdmin(false)
      }
      router.refresh()
    })

    return () => {
      alive = false
      sub?.subscription?.unsubscribe()
    }
  }, [router])

  async function togglePin() {
    if (!user || !isAdmin || loading) return
    setLoading(true)
    try {
      // ✅ uuid + boolean 두 인수 모두 전달
      const { error } = await supabase.rpc('set_post_pin', {
        p_post: String(postId),   // uuid
        p_value: !pinned          // 바꿀 값
      })
      if (error) throw error

      // ✅ 낙관적 업데이트 + 서버 새로고침
      setPinned((v) => !v)
      router.refresh()
    } catch (err) {
      alert('고정 상태 변경 실패: ' + (err?.message || String(err)))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const badge = isAdmin === null ? '확인 중…' : isAdmin ? '관리자' : '관리자 아님'

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
          pinned
            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } ${!isAdmin || loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
        aria-disabled={!isAdmin || loading}
      >
        {pinned ? '📍 고정 해제하기' : '📌 고정하기'}
      </button>
    </div>
  )
}
