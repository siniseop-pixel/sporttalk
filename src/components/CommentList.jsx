'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient.js'

export default function CommentList({ postId }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError('')
      const { data, error } = await supabase
        .from('comments')
        .select('id,body,nickname,created_at')
        .eq('post_id', Number(postId))
        .order('created_at', { ascending: true })

      if (!alive) return
      if (error) setError(error.message)
      setRows(data || [])
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [postId])

  if (loading) return <div className="text-sm text-gray-500">불러오는 중…</div>
  if (error)   return <div className="text-sm text-red-600">댓글 로드 오류: {error}</div>
  if (!rows.length) return <div className="text-sm text-gray-500">첫 댓글을 남겨보세요!</div>

  return (
    <ul className="divide-y">
      {rows.map(c => (
        <li key={c.id} className="py-2">
          <div className="text-sm">{c.body}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {c.nickname || '익명'} · {new Date(c.created_at).toLocaleString()}
          </div>
        </li>
      ))}
    </ul>
  )
}
