'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient.js'

export default function WritePage({ params: { slug } }) {
  const [title, setTitle] = useState('')
  const [body, setBody]   = useState('')
  const [nickname, setNickname] = useState('')

  async function onSubmit(e){
    e.preventDefault()
    const { data, error } = await supabase
      .from('posts')
      .insert({ slug, title, body, nickname })
      .select('id').single()
    if (error) return alert(error.message)
    location.href = `/boards/${slug}/${data.id}`
  }

  return (
    <form onSubmit={onSubmit} className="card p-4 grid gap-3 max-w-2xl">
      <h2 className="font-bold text-lg">글쓰기</h2>
      <input className="border rounded p-2" placeholder="닉네임(선택)" value={nickname} onChange={e=>setNickname(e.target.value)} />
      <input className="border rounded p-2" placeholder="제목" value={title} onChange={e=>setTitle(e.target.value)} required />
      <textarea className="border rounded p-2 h-40" placeholder="내용" value={body} onChange={e=>setBody(e.target.value)} required />
      <button className="rounded bg-black text-white px-3 py-2">등록</button>
    </form>
  )
}
