'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient.js'

export default function CommentActions({ comment }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [body, setBody] = useState(comment?.body ?? '')
  const [busy, setBusy] = useState(false)

  async function getUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) return null
    return data?.user ?? null
  }

  async function handleDelete() {
    if (busy) return
    const user = await getUser()
    if (!user || user.id !== comment.author_id) {
      alert('삭제 권한이 없습니다.')
      return
    }
    if (!confirm('댓글을 삭제하시겠습니까?')) return

    setBusy(true)
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', comment.id)
      .eq('author_id', user.id)
    setBusy(false)

    if (error) {
      alert('삭제 실패: ' + error.message)
      return
    }
    router.refresh()
  }

  async function handleUpdate(e) {
    e.preventDefault()
    if (busy) return

    const user = await getUser()
    if (!user || user.id !== comment.author_id) {
      alert('수정 권한이 없습니다.')
      return
    }

    const next = (body ?? '').trim()
    if (!next) {
      alert('내용을 입력해 주세요.')
      return
    }

    setBusy(true)
    const { error } = await supabase
      .from('comments')
      .update({ body: next })
      .eq('id', comment.id)
      .eq('author_id', user.id)
    setBusy(false)

    if (error) {
      alert('수정 실패: ' + error.message)
      return
    }

    setEditing(false)
    router.refresh()
  }

  if (editing) {
    return (
      <form onSubmit={handleUpdate} className="mt-1 space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-1 focus:ring-emerald-500"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busy}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1 rounded-md disabled:opacity-70"
          >
            저장
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setEditing(false)}
            className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded-md disabled:opacity-70"
          >
            취소
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="flex gap-2 mt-1">
      <button
        onClick={() => setEditing(true)}
        disabled={busy}
        className="bg-sky-50 border border-sky-200 text-sky-700 text-[12px] px-2 py-1 rounded-md active:scale-95 disabled:opacity-70"
      >
        수정
      </button>
      <button
        onClick={handleDelete}
        disabled={busy}
        className="bg-red-50 border border-red-200 text-red-700 text-[12px] px-2 py-1 rounded-md active:scale-95 disabled:opacity-70"
      >
        삭제
      </button>
    </div>
  )
}
