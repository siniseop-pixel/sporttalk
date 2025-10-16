// src/app/boards/[slug]/BoardClient.jsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient.js'
import VoteButton from '@/components/VoteButton.jsx'
import LikeButton from '@/components/LikeButton.jsx'

export default function BoardClient({ slug }) {
  const [posts, setPosts] = useState([])
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setErr(null)
      try {
        // ✅ comment_count 대신 집계 사용 (comments:comments(count))
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id, slug, title, nickname, created_at, is_pinned,
            like_count, upvote_count,
            comments:comments(count)
          `)
          .eq('slug', slug)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error
        if (alive) setPosts(data ?? [])
      } catch (e) {
        if (alive) setErr(e.message || String(e))
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [slug])

  const commentCount = (row) =>
    Array.isArray(row.comments) ? row.comments[0]?.count ?? 0 : 0

  if (err) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {err}
      </div>
    )
  }

  if (loading) return <div className="text-sm text-gray-500">불러오는 중…</div>
  if (!posts.length) return <div className="text-gray-600">아직 게시글이 없어요. 첫 글을 남겨보세요!</div>

  return (
    <ul className="space-y-3">
      {posts.map((p) => (
        <li key={p.id} className="rounded-xl border p-3">
          {/* ✅ 제목만 링크로 감싸서 버튼 클릭 시 라우팅되지 않게 */}
          <Link href={`/boards/${slug}/${p.id}`} className="no-underline hover:underline">
            <div className="font-semibold">{p.title}</div>
          </Link>

          <div className="mt-1 text-xs text-gray-500">
            {p.nickname || '익명'} · {new Date(p.created_at).toLocaleString()}
            {p.is_pinned ? <span className="ml-2 text-amber-700">📌 고정</span> : null}
          </div>

          {/* ✅ 목록에서도 바로 추천/좋아요 가능 */}
          <div className="mt-3 flex items-center gap-4">
            <VoteButton postId={p.id} count={p.upvote_count ?? 0} />
            <LikeButton postId={p.id} initialCount={p.like_count ?? 0} />
            <Link
              href={`/boards/${slug}/${p.id}#comments`}
              className="text-xs text-gray-600 hover:underline"
            >
              댓글 {commentCount(p)}
            </Link>
          </div>
        </li>
      ))}
    </ul>
  )
}
