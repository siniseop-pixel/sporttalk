// src/components/WriteForm.jsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient.js'

export default function WriteForm({ slug }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody]   = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    const titleTrim = title.trim()
    const bodyTrim  = body.trim()
    if (!titleTrim) return alert('제목을 입력해 주세요.')

    setLoading(true)
    try {
      // 로그인 필수 (익명 허용 원하면 이 부분 조정)
      const { data: u } = await supabase.auth.getUser()
      const user = u?.user
      if (!user) throw new Error('로그인이 필요합니다.')

      // 이미지 업로드 (public 버킷: images-public)
      let urls = []
      if (files.length) {
        const uploads = files.map(async (f) => {
          const path = `${user.id}/${Date.now()}-${encodeURIComponent(f.name)}`
          const up = await supabase
            .storage
            .from('images-public')
            .upload(path, f, { upsert: false, contentType: f.type || 'application/octet-stream' })
          if (up.error) throw up.error
          const { data } = supabase.storage.from('images-public').getPublicUrl(up.data.path)
          return data.publicUrl
        })
        urls = await Promise.all(uploads)
      }

      // 게시글 저장 (slug 기준으로 통일)
      const { data, error } = await supabase
        .from('posts')
        .insert({
          slug,
          author_id: user.id,
          nickname: user.email ?? null,
          title: titleTrim,
          body: bodyTrim,
          image_urls: urls.length ? urls : null,
        })
        .select('id')
        .single()

      if (error) throw error

      // 이동
      router.push(`/boards/${slug}/${data.id}`)
      router.refresh()
      setTitle('')
      setBody('')
      setFiles([])
    } catch (err) {
      alert('게시글 저장 실패: ' + (err?.message || err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 grid gap-3 max-w-2xl">
      <h2 className="font-bold text-lg">글쓰기</h2>

      <input
        className="border rounded-xl px-3 py-2"
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        className="border rounded-xl px-3 py-2 min-h-48"
        placeholder="내용"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
        className="text-sm"
      />

      <div className="flex justify-end">
        <button
          className="rounded bg-black text-white px-4 py-2 text-sm md:text-base active:scale-95 disabled:opacity-70"
          disabled={loading}
        >
          {loading ? '등록 중…' : '등록'}
        </button>
      </div>
    </form>
  )
}
