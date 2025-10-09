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

  // ✅ 로그인 + 관리자 여부 확인
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
          console.warn('프로필 조회 실패:', error.message)
          setIsAdmin(false)
        } else {
          setIsAdmin(!!data?.is_admin)
        }
      }
    })()
    return () => { mounted = false }
  }, [])

  // ✅ 디버그용 표시 (지워도 됨)
  console.log('user:', user?.email, 'isAdmin:', isAdmin)

  async function togglePin() {
    if (!isAdmin || loading) return
    setLoading(true)
    const { error } = await sb.from('posts').update({ is_pinned: !post.is_pinned }).eq('id', post.id)
    setLoading(false)
    if (error) {
      alert('고정/해제 실패: ' + error.message)
      console.error(error)
    } else {
      router.refresh()
    }
  }

  async function deletePost() {
    if (!user || loading) return
    const confirmDel = confirm('정말 삭제할까요?')
    if (!confirmDel) return
    setLoading(true)
    const { error } = await sb.from('posts').delete().eq('id', post.id)
    setLoading(false)
    if (error) {
      alert('삭제 실패: ' + error.message)
      console.error(error)
    } else {
      router.push(`/boards/${slug}`)
      router.refresh()
    }
  }

  return (
    <div className="flex gap-2 mt-3">
      {/* ✅ 관리자 여부를 항상 표시 */}
      <span className="text-xs px-2 py-1 bg-gray-100 rounded border">
        {isAdmin ? '관리자 계정 ✅' : '관리자 아님 ❌'}
      </span>

      {/* 관리자만 고정 버튼 표시 */}
      {isAdmin && (
        <button
          onClick={togglePin}
          className={`text-xs md:text-sm px-3 py-1 rounded-lg border ${
            post.is_pinned
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {post.is_pinned ? '📍 고정 해제' : '📌 고정'}
        </button>
      )}

      {/* 작성자/관리자만 삭제 버튼 */}
      {user?.id === post.author_id || isAdmin ? (
        <button
          onClick={deletePost}
          className="text-xs md:text-sm px-3 py-1 rounded-lg border bg-red-50 text-red-700 hover:bg-red-100"
        >
          🗑 삭제
        </button>
      ) : null}
    </div>
  )
}
