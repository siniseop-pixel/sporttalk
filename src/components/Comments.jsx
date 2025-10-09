import CommentActions from './CommentActions.jsx'

import { supabase } from '../lib/supabaseClient.js'

export default async function Comments({ postId }) {
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    return <div style={{ color:'#b91c1c' }}>댓글 불러오기 오류: {error.message}</div>
  }

  if (!comments || comments.length === 0) {
    return <div style={{ color:'#777', fontSize:13 }}>아직 댓글이 없어요.</div>
  }

  return (
    <div style={{ display:'grid', gap:8, marginTop:8 }}>
      {comments.map(c => (
        <div key={c.id} style={{ padding:'8px 0', borderBottom:'1px solid #eee' }}>
          <div style={{ fontSize:12, color:'#555' }}>
            {c.nickname || '게스트'} · {new Date(c.created_at).toLocaleString()}
          </div>
          <div style={{ whiteSpace:'pre-wrap' }}>{c.body}</div>
          <CommentActions comment={c} />

        </div>
      ))}
    </div>
  )
}
