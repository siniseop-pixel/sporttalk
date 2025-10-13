import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function PUT(req, { params }) {
  const supabase = getSupabaseAdmin();
  const { id } = params;
  const { title, content } = await req.json();
  if (!title || !content) return new Response('Missing title or content', { status: 400 });

  const { error } = await supabase.from('posts').update({ title, content }).eq('id', id);
  return error ? new Response(error.message, { status: 400 }) : new Response('ok');
}

export async function DELETE(req, { params }) {
  const supabase = getSupabaseAdmin();
  const { id } = params;
  const { error } = await supabase.from('posts').delete().eq('id', id);
  return error ? new Response(error.message, { status: 400 }) : new Response('ok');
}
