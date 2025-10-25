'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient.js'

export default function SimpleDeleteButton({ postId, authorId, onDelete }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (loading) return
    if (!confirm('정말 삭제하시겠습니까?')) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.id !== authorId) {
        alert('권한이 없습니다.')
        return
      }

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      // 목록에서 즉시 제거
      if (onDelete) {
        onDelete(postId)
      }
    } catch (err) {
      alert('삭제 실패: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-600 hover:underline disabled:opacity-50"
    >
      {loading ? '삭제 중...' : '삭제'}
    </button>
  )
}

