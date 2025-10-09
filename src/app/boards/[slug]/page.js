import { supabase } from '../../../lib/supabaseClient.js'
import ComposePost from '../../../components/ComposePost.jsx'
import Comments from '../../../components/Comments.jsx'
import CommentBox from '../../../components/CommentBox.jsx'
import PostActions from '../../../components/PostActions.jsx'

export const revalidate = 0

export default async function BoardDetail({ params: { slug } }) {
  const { data: boards } = await supabase.from('boards').select('*').eq('slug', slug).limit(1)
  const board = boards?.[0]
  if (!board) return <main className="p-4">보드를 찾을 수 없습니다.</main>

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('board_id', board.id)
    .order('created_at', { ascending: false })

  const themes = {
    swimming:   { icon: '🏊', bg: 'bg-blue-50', text: 'text-blue-700' },
    soccer:     { icon: '⚽', bg: 'bg-gray-100', text: 'text-gray-900' }, // 축구: 다크
    basketball: { icon: '🏀', bg: 'bg-orange-50', text: 'text-orange-700' },
    baseball:   { icon: '⚾', bg: 'bg-gray-50', text: 'text-gray-700' },
    tennis:     { icon: '🎾', bg: 'bg-lime-50', text: 'text-lime-700' },
    badminton:  { icon: '🏸', bg: 'bg-pink-50', text: 'text-pink-700' },
    crossfit:   { icon: '🏋️‍♀️', bg: 'bg-amber-50', text: 'text-amber-700' },
    fitness:    { icon: '💪', bg: 'bg-brand-50', text: 'text-brand-700' },
    running:    { icon: '🏃', bg: 'bg-cyan-50', text: 'text-cyan-700' },
    climbing:   { icon: '🧗', bg: 'bg-purple-50', text: 'text-purple-700' },
  }
  const t = themes[slug] || { icon: '🏅', bg: 'bg-gray-50', text: 'text-gray-700' }

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-6">
      <div className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 mb-4 md:mb-6 rounded-2xl border ${t.bg}`}>
        <div className={`text-2xl md:text-3xl ${t.text}`}>{t.icon}</div>
        <div>
          <h1 className={`text-lg md:text-xl font-bold ${t.text}`}>{board.name}</h1>
          <p className="text-xs md:text-sm text-gray-600">#{slug} 게시판</p>
        </div>
      </div>

      <ul className="grid gap-3 md:gap-4">
        {(posts || []).map((p) => (
          <li key={p.id} className="card p-3 md:p-4">
            <div className="font-semibold text-base md:text-lg">{p.title}</div>
            <div className="text-gray-700 whitespace-pre-wrap mt-1 text-sm md:text-base">{p.body}</div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">
              {p.nickname} · {new Date(p.created_at).toLocaleString()}
            </div>

            <PostActions post={p} />

            <div className="mt-3 md:mt-4">
              <h4 className="font-medium text-xs md:text-sm text-gray-600 mb-1">댓글</h4>
              <Comments postId={p.id} />
              <CommentBox postId={p.id} />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 md:mt-6">
        <ComposePost boardId={board.id} />
      </div>
    </main>
  )
}
