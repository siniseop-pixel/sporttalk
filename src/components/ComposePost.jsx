// src/components/ComposePost.jsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient.js'

export default function ComposePost({ slug }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return

    const titleTrim = (title ?? '').trim()
    const bodyTrim  = (body ?? '').trim()
    if (!titleTrim) return alert('제목을 입력하세요.')
    if (!bodyTrim)  return alert('내용을 입력하세요.')

    setLoading(true)
    try {
      // 로그인 유저 정보(익명 허용 시 없어도 OK)
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user ?? null

      const payload = {
        slug,                       // ✅ 프로젝트의 다른 파일들과 일치
        title: titleTrim,
        body: bodyTrim,
        nickname: user?.email ?? null,
        author_id: user?.id ?? null,
      }

      const { data, error } = await supabase
        .from('posts')
        .insert(payload)
        .select('id')
        .single()

      if (error) {
        alert('게시글 저장 실패: ' + error.message)
        return
      }

      // 새 글 상세로 이동
      router.push(`/boards/${slug}/${data.id}`)
      router.refresh()
      setTitle('')
      setBody('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-3 md:p-4 grid gap-2 md:gap-3 max-w-2xl">
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
        rows={5}
        placeholder="내용을 입력하세요"
        className="w-full rounded-xl border border-gray-300 px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black text-white px-4 py-2 text-sm md:text-base min-h-10 active:scale-95 disabled:opacity-70"
        >
          {loading ? '등록 중…' : '게시글 등록'}
        </button>
      </div>
    </form>
  )
}
