'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient.js'

export default function CommentBox({ postId }) {
  const [nickname, setNickname] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)

  async function submit() {
    if (loading) return
    const text = body.trim()
    if (!text) return

    setLoading(true)
    setErr(null)
    try {
      const { data: u } = await supabase.auth.getUser()
      const user = u?.user || null

      const { error } = await supabase.from('comments').insert({
        post_id: postId,                 // ❌ Number() 금지
        author_id: user?.id ?? null,     // uuid
        nickname: nickname || user?.email || null,
        body: text,
      })
      if (error) throw error

      setBody('')
      // 댓글 목록 새로 고침은 상위에서 하거나, 여기서 location.reload() 대신
      // 상태 끌어올리기/콜백으로 처리해도 OK
    } catch (e) {
      setErr(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {err && <div className="text-sm text-red-600 mb-2">댓글 로드 오류: {err}</div>}
      <input
        className="border rounded px-2 py-1 text-sm w-full mb-2"
        placeholder="닉네임(선택)"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <input
        className="border rounded px-2 py-2 text-sm w-full"
        placeholder="댓글을 입력하세요"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button
        className="ml-2 mt-2 px-3 py-1 rounded bg-black text-white text-sm active:scale-95 disabled:opacity-60"
        onClick={submit}
        disabled={loading}
      >
        등록
      </button>
    </div>
  )
}
