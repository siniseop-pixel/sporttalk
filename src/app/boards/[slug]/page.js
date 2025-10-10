import { supabase } from '@/lib/supabaseClient.js'
import Link from 'next/link'
import VoteButton from '@/components/VoteButton.jsx'
import AdSlot from '@/components/AdSlot.jsx'
import SurveyWidget from '@/components/SurveyWidget.jsx'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BoardPage({ params: { slug } }) {
  const { data: board } = await supabase.from('boards').select('*').eq('slug', slug).single()
  if (!board) return <main className="p-4">보드를 찾을 수 없어요.</main>

  const { data: posts } = await supabase
    .from('post_ranking')
    .select('*')
    .eq('board_id', board.id)
    .order('is_pinned', { ascending: false })
    .order('score', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-6 grid gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{board.name}</h1>
          <p className="text-xs text-gray-500">#{slug} 게시판</p>
        </div>
        <Link href={`/boards/${slug}/write`} className="btn btn-primary">글쓰기</Link>
      </header>

      {/* 광고 & 설문 */}
      <AdSlot id="boards-top" />
      <SurveyWidget />

      <ul className="grid gap-2">
        {(posts || []).map(p => (
          <li key={p.id} className="card p-3 md:p-4">
            <div className="flex items-start gap-3">
              <VoteButton postId={p.id} count={p.upvotes_count}/>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {p.is_pinned && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 border">고정</span>}
                  <Link href={`/boards/${slug}/${p.id}`} className="font-semibold hover:underline truncate">
                    {p.title}
                  </Link>
                </div>
                <div className="text-xs text-gray-500 mt-1 flex gap-3 flex-wrap">
                  <span>{p.nickname || '익명'}</span>
                  <span>{new Date(p.created_at).toLocaleString()}</span>
                  <span>추천 {p.upvotes_count}</span>
                  <span>댓글 {p.comments_count}</span>
                  <span>조회 {p.views_count}</span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <AdSlot id="boards-bottom" />
    </main>
  )
}
