// src/app/boards/[slug]/[postId]/page.jsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { notFound } from 'next/navigation';
import { getServerClient } from '@/lib/supabaseServer.js';

// 클라이언트 컴포넌트들
import HeaderBreadcrumb from '@/components/HeaderBreadcrumb.jsx';
import TogglePinButton from '@/components/TogglePinButton.jsx';
import VoteButton from '@/components/VoteButton.jsx';
import LikeButton from '@/components/LikeButton.jsx';
import CommentSection from '@/components/CommentSection.jsx';
import PostImageGrid from '@/components/PostImageGrid.jsx';
import DeletePostButton from '@/components/DeletePostButton.jsx';

export default async function Page({ params }) {
  // Next 15: params는 Promise로 들어와서 먼저 await 필요
  const { slug: rawSlug, postId: rawPostId } = await params;
  const slug = String(rawSlug || '');
  const postId = String(rawPostId || '');

  const supabase = getServerClient();
  if (!supabase || !slug || !postId) notFound();

  // 게시글 가져오기 (uuid id + slug 동시 매칭)
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      id, slug, title, body, nickname, author_id,
      created_at, is_pinned,
      like_count, upvote_count,
      image_urls
    `)
    .eq('id', postId)
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('[post select error]', error);
    notFound();
  }
  if (!post) notFound();

  // (선택) 조회수 증가 RPC가 있다면 호출 – 없으면 무시
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
        {/* 제목/작성자/시간 */}
        <h1 className="text-xl md:text-2xl font-bold">{post.title}</h1>
        <div className="mt-1 text-xs text-gray-500">
          {post.nickname || '익명'} · {new Date(post.created_at).toLocaleString()}
        </div>

        {/* 본문 */}
        <div className="mt-4 whitespace-pre-wrap leading-7 text-[15px]">
          {post.body}
        </div>

        {/* 이미지 */}
        {!!images.length && (
          <div className="mt-4">
            <PostImageGrid urls={images} colsSm={2} colsMd={3} aspect="h-40" />
          </div>
        )}

        {/* 행동 버튼 영역 */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {/* 추천/좋아요 */}
          <VoteButton postId={post.id} count={post.upvote_count ?? 0} />
          <LikeButton postId={post.id} initialCount={post.like_count ?? 0} />

          {/* 관리자 전용: 고정/해제 */}
          <TogglePinButton postId={post.id} isPinned={!!post.is_pinned} />

          {/* 작성자 또는 관리자만 노출/동작: 삭제 */}
          <DeletePostButton postId={post.id} authorId={post.author_id} />
        </div>

        {/* 댓글 */}
        <CommentSection postId={post.id} />
      </main>
    </>
  );
}
