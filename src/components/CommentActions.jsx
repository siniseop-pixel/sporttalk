'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient.js'
import { useRouter } from 'next/navigation'

export default function CommentActions({ comment }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [body, setBody] = useState(comment.body)

  async function getUser() {
    const { data } = await supabase.auth.getUser()
    return data.user
  }

  async function handleDelete() {
    const user = await getUser()
    if (!user || user.id !== comment.author_id) {
      alert('삭제 권한이 없습니다.')
      return
    }
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    const { error } = await supabase.from('comments').delete().eq('id', comment.id)
    if (error) alert('삭제 실패: ' + error.message)
    router.refresh()
  }

  async function handleUpdate(e) {
    e.preventDefault()
    const user = await getUser()
    if (!user || user.id !== comment.author_id) {
      alert('수정 권한이 없습니다.')
      return
    }
    const { error } = await supabase.from('comments').update({ body }).eq('id', comment.id)
    if (error) alert('수정 실패: ' + error.message)
    setEditing(false)
    router.refresh()
  }

  if (editing) {
    return (
      <form onSubmit={handleUpdate} style={{ marginTop: 4 }}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          style={{ width: '100%', borderRadius: 6, border: '1px solid #ccc', padding: 6 }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            type="submit"
            style={{
              background: '#059669',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '4px 8px',
            }}
          >
            저장
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            style={{
              background: '#ddd',
              border: 'none',
              borderRadius: 6,
              padding: '4px 8px',
            }}
          >
            취소
          </button>
        </div>
      </form>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
      <button
        onClick={() => setEditing(true)}
        style={{
          background: '#e0f2fe',
          border: '1px solid #bae6fd',
          borderRadius: 6,
          padding: '2px 6px',
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        수정
      </button>
      <button
        onClick={handleDelete}
        style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: 6,
          padding: '2px 6px',
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        삭제
      </button>
    </div>
  )
}
