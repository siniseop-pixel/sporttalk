// src/app/boards/[slug]/[postId]/page.jsx
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient.js'
import PostImageGrid from '@/components/PostImageGrid.jsx'
import CommentList from '@/components/CommentList.jsx'
import CommentBox from '@/components/CommentBox.jsx'
import LikeButton from '@/components/LikeButton.jsx'

export const revalidate = 0

export default async function ReadPost({ params: { slug, postId } }) {
  const pid = Number(postId)

  // 1) 게시글 가져오기
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', pid)
    .single()

  if (error || !post) {
    return <main className="p-4 text-gray-600">게시글을 찾을 수 없어요.</main>
  }

  // 2) 조회수 증가 (에러 무시)
  await supabase.rpc('increment_views', { p_post: pid }).catch(() => {})

  // 3) 이전/다음 글 탐색 (작성 시각 기준)
  const { data: prevPost } = await supabase
    .from('posts')
    .select('id,title')
    .eq('slug', slug)
    .gt('created_at', post.created_at)                 // 현재 글보다 "더 새로 작성된" 글 1개
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  const { data: nextPost } = await supabase
    .from('posts')
    .select('id,title')
    .eq('slug', slug)
    .lt('created_at', post.created_at)                 // 현재 글보다 "더 예전에 작성된" 글 1개
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <main className="max-w-3xl mx-auto grid gap-4 p-4 md:p-6">

      {/* 상단 내비게이션: 뒤로가기 / 이전글 / 다음글 */}
      <nav className="flex items-center justify-between gap-2">
        <Link
          href={`/boards/${slug}`}
          className="text-sm px-3 py-1.5 rounded-md border bg-white hover:bg-gray-50 active:scale-95"
        >
          ← 게시판으로
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={prevPost ? `/boards/${slug}/${prevPost.id}` : '#'}
            aria-disabled={!prevPost}
            className={`text-sm px-3 py-1.5 rounded-md border bg-white active:scale-95
              ${prevPost ? 'hover:bg-gray-50' : 'opacity-50 pointer-events-none'}`}
            title={prevPost ? prevPost.title : '이전 글이 없습니다'}
          >
            ↑ 이전글
          </Link>
          <Link
            href={nextPost ? `/boards/${slug}/${nextPost.id}` : '#'}
            aria-disabled={!nextPost}
            className={`text-sm px-3 py-1.5 rounded-md border bg-white active:scale-95
              ${nextPost ? 'hover:bg-gray-50' : 'opacity-50 pointer-events-none'}`}
            title={nextPost ? nextPost.title : '다음 글이 없습니다'}
          >
            ↓ 다음글
          </Link>
        </div>
      </nav>

      {/* 본문 */}
      <article className="card p-4 md:p-6">
        {/* 제목 + 작성자/메타 + 좋아요 */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold break-words">{post.title}</h1>
            <div className="text-sm text-gray-500 mt-1">
              {post.nickname || '익명'} · {new Date(post.created_at).toLocaleString()}
              {post.is_pinned ? <span className="ml-2 text-amber-700">📌 고정됨</span> : null}
            </div>
          </div>
          <LikeButton postId={post.id} initialCount={post.likes_count || 0} />
        </div>

        {/* 본문 내용 */}
        {post.body && (
          <div className="whitespace-pre-wrap mt-4 text-gray-800 leading-relaxed">
            {post.body}
          </div>
        )}

        {/* 첨부 이미지 (next/image 최적화) */}
        {Array.isArray(post.image_urls) && post.image_urls.length > 0 && (
          <PostImageGrid
            urls={post.image_urls}
            colsSm={2}
            colsMd={3}
            aspect="h-40"
            className="my-4"
          />
        )}

        {/* 통계 메타 */}
        <div className="text-xs text-gray-500 mt-3">
          👁️ {post.views || 0} · 👍 {post.likes_count || 0} · 💬 {post.comments_count || 0}
        </div>
      </article>

      {/* 댓글 */}
      <section className="card p-4 md:p-6 grid gap-3">
        <h3 className="font-semibold text-base">댓글</h3>
        <CommentList postId={post.id} />
        <CommentBox postId={post.id} />
      </section>
    </main>
  )
}
