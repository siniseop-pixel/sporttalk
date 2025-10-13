import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req, { params }) {
  const supabase = getSupabaseAdmin();
  const { userId, like } = await req.json();
  const postId = params.id;
  if (!userId) return new Response('Missing userId', { status: 400 });

  if (like) {
    const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
    if (error && error.code !== '23505') return new Response(error.message, { status: 400 });
    await supabase.rpc('bump_like_count', { p_post_id: postId, p_delta: 1 }).catch(async () => {
      const { data: post } = await supabase.from('posts').select('like_count').eq('id', postId).single();
      const next = Math.max(0, (post?.like_count ?? 0) + 1);
      await supabase.from('posts').update({ like_count: next }).eq('id', postId);
    });
  } else {
    await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    await supabase.rpc('bump_like_count', { p_post_id: postId, p_delta: -1 }).catch(async () => {
      const { data: post } = await supabase.from('posts').select('like_count').eq('id', postId).single();
      const next = Math.max(0, (post?.like_count ?? 0) - 1);
      await supabase.from('posts').update({ like_count: next }).eq('id', postId);
    });
  }

  return new Response('ok');
}
