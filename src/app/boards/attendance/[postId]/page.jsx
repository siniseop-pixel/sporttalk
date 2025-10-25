// src/app/boards/attendance/[postId]/page.jsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerClient } from '@/lib/supabaseServer.js';

// 클라이언트 컴포넌트들
import HeaderBreadcrumb from '@/components/HeaderBreadcrumb.jsx';
import TogglePinButton from '@/components/TogglePinButton.jsx';
import VoteButton from '@/components/VoteButton.jsx';
import LikeButton from '@/components/LikeButton.jsx';
import CommentList from '@/components/CommentList.jsx';
import CommentBox from '@/components/CommentBox.jsx';
import PostImageGrid from '@/components/PostImageGrid.jsx';
import DeletePostButton from '@/components/DeletePostButton.jsx';
import ViewCounter from '@/components/ViewCounter.jsx';

export default async function AttendancePostPage({ params }) {
  // Next 15: params는 Promise로 들어와서 먼저 await 필요
  const { postId: rawPostId } = await params;
  const postId = String(rawPostId || '');

  const supabase = getServerClient();
  if (!supabase || !postId) notFound();

  // 출석 게시글 가져오기
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      id, slug, title, body, nickname, author_id,
      created_at, is_pinned,
      like_count, upvote_count, view_count,
      image_urls
    `)
    .eq('id', postId)
    .eq('slug', 'attendance')
    .maybeSingle();

  if (error) {
    console.error('[attendance post select error]', error);
    notFound();
  }
  if (!post) notFound();

  // 조회수 증가
  try {
    await supabase.rpc('bump_post_view', { p_post: post.id });
  } catch (e) {
    // 조회수 기능이 없거나 실패해도 화면은 계속 보여줌
  }

  const images = Array.isArray(post.image_urls) ? post.image_urls : [];

  return (
    <>
      <HeaderBreadcrumb />

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4">
          <Link href="/boards/attendance" className="text-blue-600 hover:underline">
            ← 출석 게시판으로 돌아가기
          </Link>
        </div>

        <article className="rounded-xl border p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold">{post.title}</h1>

          <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
            <span>{post.nickname || '익명'} · {new Date(post.created_at).toLocaleString()}</span>
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
            <LikeButton postId={post.id} initialCount={post.like_count ?? 0} />
            <TogglePinButton postId={post.id} isPinned={!!post.is_pinned} />
            <DeletePostButton postId={post.id} />
          </div>

          <section className="mt-8">
            <h2 className="text-sm font-semibold mb-2">댓글</h2>
            <CommentList postId={post.id} />
            <div className="mt-3">
              <CommentBox postId={post.id} />
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
