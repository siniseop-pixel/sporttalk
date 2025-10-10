'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient.js'

export default function LikeButton({ postId, initialCount=0 }) {
  const [n, setN] = useState(initialCount)
  const [busy, setBusy] = useState(false)

  async function like() {
    if (busy) return
    setBusy(true)
    const { error } = await supabase.rpc('like_post', { p_post: postId })
    if (!error) setN(x => x + 1)
    setBusy(false)
  }

  return (
    <button onClick={like} disabled={busy}
      className="text-xs px-2 py-1 rounded border active:scale-95">
      👍 {n}
    </button>
  )
}
