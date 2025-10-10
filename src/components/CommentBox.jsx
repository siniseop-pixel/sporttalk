'use client'
import { useState } from 'react'
export default function CommentBox({ postId }) {
  const [text, setText] = useState('')
  return (
    <form className="flex gap-2" onSubmit={e=>{e.preventDefault(); setText('')}}>
      <input className="flex-1 border rounded p-2" value={text} onChange={e=>setText(e.target.value)} placeholder="댓글을 입력하세요" />
      <button className="px-3 rounded bg-black text-white">등록</button>
    </form>
  )
}
