// src/app/boards/[slug]/[postId]/page.jsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { notFound } from 'next/navigation';
import { getServerClient } from '@/lib/supabaseServer.js';

// UI components (client)
import HeaderBreadcrumb from '@/components/HeaderBreadcrumb.jsx';
import TogglePinButton from '@/components/TogglePinButton.jsx';
import VoteButton from '@/components/VoteButton.jsx';
import LikeButton from '@/components/LikeButton.jsx';
import CommentList from '@/components/CommentList.jsx';
import CommentBox from '@/components/CommentBox.jsx';
import PostImageGrid from '@/components/PostImageGrid.jsx';

export default async function Page({ params }) {
  // ⬇ Next 15: params is a Promise — await first
  const { slug: rawSlug, postId: rawPostId } = await params;
  const slug = String(rawSlug || '');
  const postId = String(rawPostId || '');

  // 🔎 Debug: check route params
  console.log('[PostDetail params]', { slug, postId });

  const supabase = getServerClient();
  if (!supabase || !slug || !postId) {
    console.warn('[PostDetail guard failed]', { hasSb: !!supabase, slug, postId });
    notFound();
  }

  // (optional) If you have a view-increment RPC, it can be called here with the uuid:
  // try { await supabase.rpc('increment_post_views', { p_post_id: postId }); } catch (e) {}

  // Fetch the post by uuid + slug
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      id, slug, title, body, nickname, author_id,
      created_at, is_pinned,
      like_count, upvote_count,
      image_urls
    `)
    .eq('id', postId)       // ⚠️ keep as uuid string (do NOT Number())
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('[post select error]', error);
  }
  if (!post) {
    console.warn('[post not found]', { slug, postId });
    notFound();
  }

  const images = Array.isArray(post.image_urls) ? post.image_urls : [];

  return (
    <>
      <HeaderBreadcrumb />

      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-xl md:text-2xl font-bold">{post.title}</h1>

        <div className="mt-1 text-xs text-gray-500">
          {post.nickname || '익명'} · {new Date(post.created_at).toLocaleString()}
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
        </div>

        <section className="mt-8">
          <h2 className="text-sm font-semibold mb-2">댓글</h2>
          <CommentList postId={post.id} />
          <div className="mt-3">
            <CommentBox postId={post.id} />
          </div>
        </section>
      </main>
    </>
  );
}
