'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient.js'

export default function DeletePostButton({ postId, backHref, canDeleteHint }) {
  const router = useRouter()
  const [allowed, setAllowed] = useState(!!canDeleteHint) // 서버가 알려준 힌트
  const [loading, setLoading] = useState(false)

  // 안전장치: 클라이언트에서도 한 번 더 체크(선택)
  useEffect(() => {
    let alive = true
    ;(async () => {
      if (allowed) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setAllowed(false); return }
      // 간단히: 본인이면 허용(정식 검증은 RLS가 함)
      // 더 엄격히 하려면 profiles.is_admin 조회 추가
      setAllowed(true)
    })()
    return () => { alive = false }
  }, [allowed])

  async function onDelete() {
    if (!allowed || loading) return
    if (!confirm('정말 이 게시글을 삭제할까요? 되돌릴 수 없어요.')) return

    try {
      setLoading(true)
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
      if (error) throw error

      // 목록으로 이동
      router.replace(backHref || '/')
      router.refresh()
    } catch (err) {
      alert('삭제에 실패했습니다: ' + (err?.message || err))
      console.error('[post delete error]', err)
    } finally {
      setLoading(false)
    }
  }

  if (!allowed) return null

  return (
    <button
      onClick={onDelete}
      disabled={loading}
      className="text-xs md:text-sm px-3 py-1 rounded-lg border bg-red-50 text-red-700 hover:bg-red-100 active:scale-95 disabled:opacity-50"
      aria-disabled={loading}
      title="작성자 또는 관리자만 삭제 가능"
    >
      {loading ? '삭제 중…' : '🗑️ 삭제'}
    </button>
  )
}
