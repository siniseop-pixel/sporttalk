'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient.js'

export default function CommentBox({ postId }) {
  const [text, setText] = useState('')
  const [nickname, setNickname] = useState('')

  async function onSubmit(e){
    e.preventDefault()
    if (!text.trim()) return
    const { error } = await supabase.from('comments').insert({ post_id: postId, body: text.trim(), nickname })
    if (error) return alert(error.message)
    setText('')
    location.reload()   // 간단 갱신 (원하면 상태로 교체)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <input className="border rounded p-2" placeholder="닉네임(선택)" value={nickname} onChange={e=>setNickname(e.target.value)} />
      <div className="flex gap-2">
        <input className="flex-1 border rounded p-2" placeholder="댓글을 입력하세요" value={text} onChange={e=>setText(e.target.value)} />
        <button className="px-3 rounded bg-black text-white">등록</button>
      </div>
    </form>
  )
}
