'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient.js'

export default function VoteButton({ postId, count = 0 }) {
  const router = useRouter()
  const [v, setV] = useState(count)
  const [loading, setLoading] = useState(false)

  async function up() {
    if (loading) return
    setLoading(true)

    try {
      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) {
        alert('로그인이 필요합니다.')
        return
      }

      const { error } = await supabase.rpc('upvote_post', {
        p_post: postId,
        p_user: user.id,
      })

      if (error) throw error

      // 낙관적 업데이트 (DB 확인 전 화면 반영)
      setV((x) => x + 1)
      router.refresh()
    } catch (err) {
      console.error('추천 실패:', err)
      alert('추천 실패: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={up}
      disabled={loading}
      className="w-14 rounded-xl border px-2 py-2 text-center hover:bg-gray-50 active:scale-95 disabled:opacity-60 transition"
    >
      <div className="text-xs text-gray-500">추천</div>
      <div className="font-semibold">{v}</div>
    </button>
  )
}
