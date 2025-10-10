import { supabase } from '@/lib/supabaseClient.js'
export const revalidate = 0

export default async function BoardList({ params: { slug } }) {
  const { data: posts } = await supabase
    .from('posts')
    .select('id,title,created_at,nickname')
    .eq('slug', slug)
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <div className="grid gap-3">
      <h2 className="text-xl font-bold">#{slug}</h2>
      <ul className="card divide-y">
        {(posts || []).map(p => (
          <li key={p.id} className="p-3 md:p-4 flex items-center justify-between">
            <a href={`/boards/${slug}/${p.id}`} className="truncate">{p.title}</a>
            <span className="text-xs text-gray-500">{p.nickname || '익명'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
