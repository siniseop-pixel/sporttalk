'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient.js'

export default function CommentList({ postId }) {
  const [items, setItems] = useState([])
  const [err, setErr] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      setErr(null)
      const { data, error } = await supabase
        .from('comments')
        .select('id, post_id, author_id, nickname, body, created_at')
        .eq('post_id', postId)                // ❌ Number() 금지
        .order('created_at', { ascending: true })

      if (error) setErr(error.message)
      else if (alive) setItems(data ?? [])
    })()
    return () => { alive = false }
  }, [postId])

  if (err) return <div className="text-sm text-red-600">댓글 로드 오류: {err}</div>

  return (
    <ul className="space-y-3">
      {items.map(c => (
        <li key={c.id} className="border rounded-lg p-2">
          <div className="text-xs text-gray-500">
            {c.nickname || '익명'} · {new Date(c.created_at).toLocaleString()}
          </div>
          <div className="mt-1 whitespace-pre-wrap text-sm">{c.body}</div>
        </li>
      ))}
    </ul>
  )
}
