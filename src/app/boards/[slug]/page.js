import { supabase } from '../../../lib/supabaseClient.js'
import Link from 'next/link'
import VoteButton from '../../../components/VoteButton.jsx'

export const dynamic = 'force-dynamic'   // 빌드타임 수집 막고 항상 런타임 쿼리
export const revalidate = 0

export default async function BoardDetail({ params: { slug } }) {
  // 보드 정보
  const { data: boards } = await supabase.from('boards').select('*').eq('slug', slug).limit(1)
  const board = boards?.[0]
  if (!board) return <main className="p-4">보드를 찾을 수 없습니다.</main>

  // 트렌딩 + 최신 + 상단고정 정렬
  const { data: posts } = await supabase
    .from('post_ranking')
    .select('*')
    .eq('board_id', board.id)
    .order('is_pinned', { ascending: false })
    .order('score', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-6 grid gap-4">
      {/* 상단 보드 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{board.name}</h1>
          <p className="text-xs md:text-sm text-gray-600">#{slug} 게시판</p>
        </div>
        <Link
          href={`/boards/${slug}/write`}
          className="btn btn-primary text-sm md:text-base"
        >
          글쓰기
        </Link>
      </div>

      {/* 인기/최신 목록 */}
      <ul className="grid gap-2 md:gap-3">
        {(posts || []).map((p) => (
          <li key={p.id} className="card p-3 md:p-4">
            <div className="flex items-start gap-3">
              {/* 추천 버튼 */}
              <div className="pt-1">
                <VoteButton postId={p.id} count={p.upvotes_count} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {p.is_pinned && (
                    <span className="text-[10px] md:text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border">
                      고정
                    </span>
                  )}
                  <Link
                    href={`/boards/${slug}/${p.id}`}
                    className="font-semibold text-base md:text-lg hover:underline truncate"
                    title={p.title}
                  >
                    {p.title}
                  </Link>
                </div>

                <div className="flex flex-wrap gap-3 mt-1 text-[11px] md:text-xs text-gray-500">
                  <span>{p.nickname || '익명'}</span>
                  <span>{new Date(p.created_at).toLocaleString()}</span>
                  <span>추천 {p.upvotes_count}</span>
                  <span>댓글 {p.comments_count}</span>
                  <span>조회 {p.views_count}</span>
                  {/* 디버그용: <span>점수 {Number(p.score).toFixed(1)}</span> */}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
