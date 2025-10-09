'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function WriteForm({ boardId, slug }) {
  const r = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { data:{ user } } = await sb.auth.getUser()
    if (!user) { alert('로그인이 필요합니다.'); setLoading(false); return }

    const urls = []
    for (const f of files) {
      const path = `${user.id}/${Date.now()}-${f.name}`
      const up = await sb.storage.from('images-public').upload(path, f, { upsert:false })
      if (!up.error) {
        urls.push(sb.storage.from('images-public').getPublicUrl(up.data.path).data.publicUrl)
      }
    }

    const { data, error } = await sb.from('posts').insert({
      board_id: boardId, author_id: user.id, nickname: user.email,
      title, body, image_urls: urls
    }).select('id').single()

    setLoading(false)
    if (error) { alert('게시글 저장 실패: '+error.message); return }
    r.push(`/boards/${slug}/${data.id}`); r.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="card p-3 grid gap-3">
      <input className="border rounded-xl px-3 py-2" placeholder="제목" value={title} onChange={e=>setTitle(e.target.value)} required/>
      <textarea className="border rounded-xl px-3 py-2" rows={8} placeholder="내용" value={body} onChange={e=>setBody(e.target.value)}/>
      <input type="file" multiple accept="image/*" onChange={e=>setFiles(Array.from(e.target.files||[]))}/>
      <div className="flex justify-end">
        <button className="btn btn-primary" disabled={loading}>{loading?'등록 중…':'등록'}</button>
      </div>
    </form>
  )
}
