import { supabase } from '@/lib/supabaseClient.js'
export const revalidate = 0

export default async function BoardList({ params: { slug } }) {
  const { data: posts } = await supabase
    .from('posts')
    .select('id,title,created_at,nickname,likes_count,comments_count,views')
    .eq('slug', slug)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="grid gap-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-xl font-bold">#{slug}</h2>
        <a href={`/boards/${slug}/write`} className="text-sm px-2 py-1 border rounded">글쓰기</a>
      </div>

      <ul className="card divide-y">
        {(posts || []).map(p => (
          <li key={p.id} className="p-3 md:p-4">
            <a href={`/boards/${slug}/${p.id}`} className="font-medium">{p.title}</a>
            <div className="text-xs text-gray-500 mt-1 flex gap-3">
              <span>{p.nickname || '익명'}</span>
              <span>{new Date(p.created_at).toLocaleString()}</span>
              <span>👍 {p.likes_count || 0}</span>
              <span>💬 {p.comments_count || 0}</span>
              <span>👁️ {p.views || 0}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
