'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient.js'
import { useRouter } from 'next/navigation'

export default function CommentBox({ postId }) {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])

  async function submit() {
    if (!user) { alert('로그인이 필요합니다'); return }
    const text = body.trim(); if (!text) return
    setLoading(true)
    const { error } = await supabase.from('comments').insert({
      post_id: postId, author_id: user.id, nickname: nickname.trim() || user.email, body: text
    })
    setLoading(false)
    if (error) { alert('댓글 등록 실패: ' + error.message); return }
    setBody(''); router.refresh()
  }

  return (
    <div className="grid gap-2 md:gap-3">
      <input
        value={nickname}
        onChange={(e)=>setNickname(e.target.value)}
        placeholder="닉네임(선택)"
        className="w-full rounded-xl border border-gray-300 px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base"
      />
      <textarea
        value={body}
        onChange={(e)=>setBody(e.target.value)}
        rows={3}
        placeholder="댓글 내용을 입력하세요"
        className="w-full rounded-xl border border-gray-300 px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base"
      />
      <div className="flex justify-end">
        <button
          onClick={submit}
          disabled={loading}
          className="btn btn-primary text-sm md:text-base min-h-10 md:min-h-11"
        >
          {loading ? '등록 중…' : '댓글 등록'}
        </button>
      </div>
    </div>
  )
}
