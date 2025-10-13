import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req) {
  const supabase = getSupabaseAdmin();
  const { postId, userId, content } = await req.json();
  if (!postId || !userId || !content) return new Response('Missing fields', { status: 400 });

  const { error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author_id: userId, content });

  return error ? new Response(error.message, { status: 400 }) : new Response('ok');
}

export async function DELETE(req) {
  const supabase = getSupabaseAdmin();
  const { commentId } = await req.json();
  if (!commentId) return new Response('Missing commentId', { status: 400 });

  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  return error ? new Response(error.message, { status: 400 }) : new Response('ok');
}
