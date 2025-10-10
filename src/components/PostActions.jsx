'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function PostActions({ post, slug }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const { data: { user } } = await sb.auth.getUser()
      if (!alive) return
      setUser(user || null)

      if (user) {
        const { data, error } = await sb
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        if (!alive) return
        if (error) console.warn('profiles select error:', error.message)
        setIsAdmin(!!data?.is_admin)
      }
    })()
    return () => { alive = false }
  }, [])

  async function onDelete() {
    if (!user) return
    if (!confirm('정말 삭제할까요?')) return
    setLoading(true)
    const { error } = await sb.from('posts').delete().eq('id', post.id)
    setLoading(false)
    if (error) return alert('삭제 실패: ' + error.message)
    router.push(`/boards/${slug}`); router.refresh()
  }

  // ✅ RLS-안전 RPC로 고정/해제
  async function togglePin() {
    if (!isAdmin || loading) return
    setLoading(true)
    const { error } = await sb.rpc('admin_toggle_pin', { p_post: post.id })
    setLoading(false)
    if (error) return alert('고정/해제 실패: ' + error.message)
    router.refresh()
  }

  const canDelete = !!user && (isAdmin || user.id === post.author_id)

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] px-2 py-0.5 rounded border bg-gray-50">
        {isAdmin ? '관리자 ✅' : (user ? '일반 사용자' : '로그인 필요')}
      </span>

      {isAdmin && (
        <button
          onClick={togglePin}
          disabled={loading}
          className={`text-xs md:text-sm px-3 py-1 rounded-lg border ${
            post.is_pinned
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {post.is_pinned ? '📍 고정 해제' : '📌 고정'}
        </button>
      )}

      {canDelete && (
        <button
          onClick={onDelete}
          disabled={loading}
          className="text-xs md:text-sm px-3 py-1 rounded-lg border bg-red-50 text-red-700 hover:bg-red-100"
        >
          🗑 삭제
        </button>
      )}
    </div>
  )
}
