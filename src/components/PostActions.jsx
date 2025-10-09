'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useRouter } from 'next/navigation'

export default function PostActions({ post }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(post.title)
  const [body, setBody] = useState(post.body)
  const [user, setUser] = useState(null)

  // 로그인 사용자 불러오기
  async function getUser() {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
    return data.user
  }

  // 삭제
  async function handleDelete() {
    const user = await getUser()
    if (!user || user.id !== post.author_id) {
      alert('삭제 권한이 없습니다.')
      return
    }
    if (!confirm('정말 이 글을 삭제하시겠습니까?')) return
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) {
      alert('삭제 실패: ' + error.message)
      return
    }
    router.refresh()
  }

  // 수정 저장
  async function handleUpdate(e) {
    e.preventDefault()
    const user = await getUser()
    if (!user || user.id !== post.author_id) {
      alert('수정 권한이 없습니다.')
      return
    }
    const { error } = await supabase
      .from('posts')
      .update({ title, body })
      .eq('id', post.id)
    if (error) {
      alert('수정 실패: ' + error.message)
      return
    }
    setEditing(false)
    router.refresh()
  }

  if (editing) {
    return (
      <form
        onSubmit={handleUpdate}
        style={{
          display: 'grid',
          gap: 8,
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: 12,
          background: '#f9fafb',
          marginTop: 8,
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ border: '1px solid #ccc', borderRadius: 6, padding: 6 }}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          style={{ border: '1px solid #ccc', borderRadius: 6, padding: 6 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="submit"
            style={{
              background: '#059669',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 10px',
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
              padding: '6px 10px',
            }}
          >
            취소
          </button>
        </div>
      </form>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      <button
        onClick={() => setEditing(true)}
        style={{
          background: '#e0f2fe',
          border: '1px solid #bae6fd',
          borderRadius: 6,
          padding: '4px 8px',
          cursor: 'pointer',
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
          padding: '4px 8px',
          cursor: 'pointer',
        }}
      >
        삭제
      </button>
    </div>
  )
}
