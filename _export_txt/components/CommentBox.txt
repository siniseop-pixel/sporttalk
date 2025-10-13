'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient.js'

export default function CommentBox({ postId }) {
  const router = useRouter()
  const [text, setText] = useState('')
  const [nickname, setNickname] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    const body = (text ?? '').trim()
    if (!body || busy) return

    setBusy(true)
    // 로그인 사용자면 author_id 저장 (익명 허용 시 null도 가능)
    const { data: userData } = await supabase.auth.getUser()
    const author_id = userData?.user?.id ?? null

    const payload = {
      post_id: Number(postId),   // DB가 int면 숫자로
      body,
      nickname: (nickname ?? '').trim() || null,
      author_id,                 // RLS/권한과 연동 시 유용
    }

    const { error } = await supabase.from('comments').insert(payload)
    setBusy(false)

    if (error) {
      alert(error.message)
      return
    }

    setText('')
    router.refresh()            // ✅ App Router 방식의 갱신
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <input
        className="border rounded p-2 text-sm"
        placeholder="닉네임(선택)"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded p-2 text-sm"
          placeholder="댓글을 입력하세요"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          disabled={busy}
          className="px-3 py-2 rounded bg-black text-white text-sm active:scale-95 disabled:opacity-70"
        >
          {busy ? '등록 중…' : '등록'}
        </button>
      </div>
    </form>
  )
}
