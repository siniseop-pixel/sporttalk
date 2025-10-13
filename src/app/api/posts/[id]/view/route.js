import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req, { params }) {
  const supabase = getSupabaseAdmin();
  const { id } = params;

  const { error } = await supabase.rpc('increment_post_view', { p_post_id: id })
    .catch(async () => {
      const { data: post } = await supabase.from('posts').select('view_count').eq('id', id).single();
      const next = (post?.view_count ?? 0) + 1;
      await supabase.from('posts').update({ view_count: next }).eq('id', id);
    });

  return error ? new Response(error.message, { status: 400 }) : new Response('ok');
}
