'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function VoteButton({ postId, count=0 }) {
  const r = useRouter()
  const [v,setV] = useState(count)
  const [loading,setLoading] = useState(false)

  async function up() {
    if (loading) return
    setLoading(true)
    const { data:{ user } } = await sb.auth.getUser()
    if (!user){ alert('로그인이 필요합니다.'); setLoading(false); return }
    await sb.rpc('upvote_post', { p_post: postId, p_user: user.id }).catch(()=>{})
    setV(x=>x+1); setLoading(false); r.refresh()
  }

  return (
    <button onClick={up} disabled={loading}
      className="w-12 rounded-xl border px-2 py-2 text-center hover:bg-gray-50">
      <div className="text-xs text-gray-500">추천</div>
      <div className="font-semibold">{v}</div>
    </button>
  )
}
