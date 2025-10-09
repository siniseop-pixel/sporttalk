// src/app/boards/[slug]/[postId]/page.js
import { supabase } from '../../../../../lib/supabaseClient.js'
import Comments from '../../../../../components/Comments.jsx'
import CommentBox from '../../../../../components/CommentBox.jsx'
import PostActions from '../../../../../components/PostActions.jsx'
import TogglePinButton from '../../../../../components/TogglePinButton.jsx'

export const revalidate = 0

export default async function ReadPost({ params:{ slug, postId } }) {
  // 게시글 1개 불러오기
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single()

  if (error || !post) {
    return <main className="p-4">게시글을 찾을 수 없어요.</main>
  }

  // 조회수 +1 (실패해도 무시)
  await supabase.rpc('increment_views', { p_post: postId }).catch(()=>{})

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-6 grid gap-4">
      <article className="card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold">{post.title}</h1>
            <div className="text-sm text-gray-500">
              {post.nickname || '익명'} · {new Date(post.created_at).toLocaleString()}
            </div>
          </div>

          {/* ✅ 운영자만 보이는 고정/해제 버튼 */}
          <TogglePinButton postId={post.id} isPinned={post.is_pinned} />
        </div>

        {/* 이미지가 있으면 표시 */}
        {Array.isArray(post.image_urls) && post.image_urls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 my-3">
            {post.image_urls.map((url, i) => (
              <img key={i} src={url} alt="" className="rounded-xl border object-cover w-full h-40" />
            ))}
          </div>
        )}

        <div className="whitespace-pre-wrap text-gray-800 mt-2">{post.body}</div>

        {/* 기존 글 수정/삭제 등 */}
        <PostActions post={post} />
      </article>

      <section className="card p-4">
        <h3 className="font-semibold mb-2">댓글</h3>
        <Comments postId={post.id} />
        <div className="mt-3">
          <CommentBox postId={post.id} />
        </div>
      </section>
    </main>
  )
}
