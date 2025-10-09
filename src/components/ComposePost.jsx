'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ComposePost({ boardId }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { alert('로그인이 필요합니다!'); setLoading(false); return }

    const { error } = await supabase.from('posts').insert({
      board_id: boardId, author_id: user.id, nickname: user.email, title, body,
    })
    if (error) { alert('게시글 저장 실패: ' + error.message) }
    else { setTitle(''); setBody(''); router.refresh() }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="card p-3 md:p-4 grid gap-2 md:gap-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력하세요"
        required
        className="w-full rounded-xl border border-gray-300 px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="내용을 입력하세요"
        className="w-full rounded-xl border border-gray-300 px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary text-sm md:text-base min-h-10 md:min-h-11"
        >
          {loading ? '등록 중…' : '게시글 등록'}
        </button>
      </div>
    </form>
  )
}
