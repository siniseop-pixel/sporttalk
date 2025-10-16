'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient.js'
import ViewCounter from '@/components/ViewCounter.jsx'
import VoteButton from '@/components/VoteButton.jsx'
import TogglePinButton from '@/components/TogglePinButton.jsx'
import CommentList from '@/components/CommentList.jsx'
import CommentBox from '@/components/CommentBox.jsx'
import PostImageGrid from '@/components/PostImageGrid.jsx'

export default function PostClient({ slug, postId }) {
  const [post, setPost] = useState(null)
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        setErr(null)
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id, slug, title, body, nickname, author_id,
            created_at, is_pinned,
            like_count, upvote_count,
            image_urls, view_count
          `)
          .eq('id', postId)      // ✅ uuid 그대로
          .eq('slug', slug)
          .maybeSingle()
        if (error) throw error
        if (alive) setPost(data)
      } catch (e) {
        if (alive) setErr(e.message || String(e))
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [slug, postId])

  if (err) return <div className="text-sm text-red-600">게시글 로드 오류: {err}</div>
  if (loading) return <div className="text-sm text-gray-500">불러오는 중…</div>
  if (!post) return <div className="text-sm text-gray-500">게시글을 찾을 수 없어요.</div>

  const images = Array.isArray(post.image_urls) ? post.image_urls : []

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-xl md:text-2xl font-bold">{post.title}</h1>

      <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
        <span>{post.nickname || '익명'} · {new Date(post.created_at).toLocaleString()}</span>
        {/* ✅ 조회수 표시 & 증가 */}
        <ViewCounter postId={post.id} initial={post.view_count ?? 0} />
      </div>

      <div className="mt-4 whitespace-pre-wrap leading-7 text-[15px]">
        {post.body}
      </div>

      {!!images.length && (
        <div className="mt-4">
          <PostImageGrid urls={images} colsSm={2} colsMd={3} aspect="h-40" />
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <VoteButton postId={post.id} count={post.upvote_count ?? 0} />
        {/* LikeButton에도 postId 문자열 그대로 전달 */}
        {/* <LikeButton postId={post.id} initialCount={post.like_count ?? 0} /> */}
        <TogglePinButton postId={post.id} isPinned={!!post.is_pinned} />
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold mb-2">댓글</h2>
        <CommentList postId={post.id} />
        <div className="mt-3">
          <CommentBox postId={post.id} />
        </div>
      </section>
    </main>
  )
}
