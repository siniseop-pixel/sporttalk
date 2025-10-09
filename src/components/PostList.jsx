import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default async function PostList({ boardId }) {
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('board_id', boardId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (!posts || posts.length === 0) {
    return <div style={{color:'#666'}}>아직 게시글이 없어요. 첫 글을 남겨보세요!</div>
  }

  return (
    <div style={{display:'grid', gap:12}}>
      {posts.map(p => (
        <div key={p.id} style={{border:'1px solid #e5e7eb', borderRadius:12, padding:16}}>
          <div style={{fontWeight:'600'}}>{p.title}</div>
          <div style={{fontSize:12, color:'#555', margin:'4px 0 8px'}}>
            by {p.nickname || '게스트'} · {new Date(p.created_at).toLocaleString()}
          </div>
          <div style={{whiteSpace:'pre-wrap'}}>{p.body}</div>
          <div style={{marginTop:8}}>
            <Link href={`?post=${p.id}`} scroll={false} style={{fontSize:13, textDecoration:'underline'}}>댓글 보기/쓰기</Link>
          </div>
        </div>
      ))}
    </div>
  )
}
