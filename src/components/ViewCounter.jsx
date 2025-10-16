'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient.js'

export default function ViewCounter({ postId, initial }) {
  const [count, setCount] = useState(initial ?? 0)

  useEffect(() => {
    if (!postId) return
    // 같은 글 중복 카운트 방지(세션 스토리지 기준)
    const key = `viewed:${postId}`
    if (sessionStorage.getItem(key)) return

    let alive = true
    ;(async () => {
      const { data, error } = await supabase.rpc('bump_post_view', { p_post: postId })
      if (!error && alive && typeof data === 'number') {
        setCount(data)
        sessionStorage.setItem(key, '1')
      }
    })()

    return () => { alive = false }
  }, [postId])

  return (
    <div className="text-xs text-gray-500" title="조회수">
      👀 {count}
    </div>
  )
}
