'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

function getAnon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default function PostClient({ slug, postId }) {
  const supabase = useMemo(() => getAnon(), []);
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [userId, setUserId] = useState(null);
  const [likeOn, setLikeOn] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [newComment, setNewComment] = useState('');

  // 화면에 띄울 진단 정보
  const [diag, setDiag] = useState({
    mounted: false,
    envUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    envKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    postsErr: null,
    commentsErr: null,
    likesErr: null,
    viewApiErr: null,
  });

  // 🔎 컴포넌트가 정말 렌더링되는지 체크
  useEffect(() => {
    setDiag((d) => ({ ...d, mounted: true }));
  }, []);

  // 세션(로그인) 체크
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data?.session?.user?.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub?.subscription?.unsubscribe();
  }, [supabase]);

  // 글/댓글 로드
  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let cancel = false;

    (async () => {
      setLoading(true);

      const { data: p, error: e1 } = await supabase
        .from('posts')
        .select('id, title, content, like_count, view_count, created_at, nickname')
        .eq('id', postId)
        .single();

      if (e1) setDiag((d) => ({ ...d, postsErr: e1?.message || String(e1) }));
      if (cancel) return;

      if (!p) {
        setPost(null);
        setComments([]);
        setLoading(false);
        return;
      }

      setPost(p);
      setLikeCount(p.like_count ?? 0);
      setViewCount(p.view_count ?? 0);

      const { data: cs, error: e2 } = await supabase
        .from('comments')
        .select('id, content, author_id, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (e2) setDiag((d) => ({ ...d, commentsErr: e2?.message || String(e2) }));
      if (!cancel) setComments(cs ?? []);

      // 내가 좋아요 눌렀는지
      if (userId) {
        const { data: liked, error: e3 } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', userId)
          .maybeSingle();
        if (e3) setDiag((d) => ({ ...d, likesErr: e3?.message || String(e3) }));
        if (!cancel) setLikeOn(!!liked);
      }

      if (!cancel) setLoading(false);
    })();

    return () => { cancel = true; };
  }, [supabase, postId, userId]);

  // 조회수 증가
  useEffect(() => {
    if (!post?.id) return;
    fetch(`/api/posts/${post.id}/view`, { method: 'POST' })
      .then(() => setViewCount((v) => v + 1))
      .catch((err) => setDiag((d) => ({ ...d, viewApiErr: err?.message || String(err) })));
  }, [post?.id]);

  const requireLogin = () => {
    if (!userId) {
      alert('로그인이 필요합니다.');
      return true;
    }
    return false;
  };

  const toggleLike = async () => {
    if (requireLogin()) return;
    const next = !likeOn;
    setLikeOn(next);
    setLikeCount((c) => Math.max(0, c + (next ? 1 : -1)));
    const res = await fetch(`/api/posts/${post.id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, like: next }),
    });
    if (!res.ok) setDiag((d) => ({ ...d, likesErr: `like api: ${res.status}` }));
  };

  const submitComment = async () => {
    if (requireLogin()) return;
    const content = newComment.trim();
    if (!content) return;
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id, userId, content }),
    });
    if (res.ok) {
      setComments((prev) => [
        ...prev,
        { id: crypto.randomUUID(), content, author_id: userId, created_at: new Date().toISOString() },
      ]);
      setNewComment('');
    } else {
      setDiag((d) => ({ ...d, commentsErr: `comment api: ${res.status}` }));
      alert('댓글 등록 실패');
    }
  };

  const onUpdate = async () => {
    if (requireLogin()) return;
    const title = prompt('새 제목', post?.title ?? '');
    const content = prompt('새 내용', post?.content ?? '');
    if (!title || !content) return;
    const res = await fetch(`/api/posts/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    if (res.ok) window.location.reload();
  };

  const onDelete = async () => {
    if (requireLogin()) return;
    if (!confirm('정말 삭제할까요?')) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
    if (res.ok) window.location.href = `/boards/${slug}`;
  };

  // ─────────── UI ───────────
  if (loading) return <main className="p-6">불러오는 중…</main>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* 진단 패널 */}
      <div className="text-xs border rounded p-3 bg-yellow-50 text-yellow-800">
        <div className="font-semibold mb-1">진단</div>
        <div>컴포넌트 실행: {String(diag.mounted)}</div>
        <div>ENV URL: {String(diag.envUrl)} / ENV ANON KEY: {String(diag.envKey)}</div>
        <div>userId: {userId || '(null)'}</div>
        <div>postsErr: {diag.postsErr || '(none)'}</div>
        <div>commentsErr: {diag.commentsErr || '(none)'}</div>
        <div>likesErr: {diag.likesErr || '(none)'}</div>
        <div>viewApiErr: {diag.viewApiErr || '(none)'}</div>
      </div>

      {!post ? (
        <div>
          <h1 className="text-xl font-bold">게시글을 찾을 수 없습니다.</h1>
          <a className="underline text-blue-600 mt-4 inline-block" href={`/boards/${slug}`}>목록으로</a>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold">{post.title}</h1>
          <div className="text-sm text-gray-500">
            {post.nickname || '익명'} · {new Date(post.created_at).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">
            조회 {viewCount} · 추천 {likeCount}
          </div>

          <article className="border p-4 rounded whitespace-pre-wrap">{post.content}</article>

          <div className="flex gap-2">
            <button className="border px-4 py-2" onClick={toggleLike}>
              {likeOn ? '추천 취소' : '추천'}
            </button>
            <button className="border px-4 py-2" onClick={onUpdate}>수정</button>
            <button className="border px-4 py-2" onClick={onDelete}>삭제</button>
          </div>

          <section>
            <h2 className="font-semibold mb-2">댓글</h2>
            <div className="flex gap-2 mb-3">
              <input
                className="flex-1 border rounded px-3 py-2"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글 입력..."
              />
              <button className="border px-4 py-2" onClick={submitComment}>등록</button>
            </div>
            <ul className="space-y-2">
              {comments.map((c) => (
                <li key={c.id} className="border rounded p-3">{c.content}</li>
              ))}
              {!comments.length && <li className="text-sm text-gray-500">첫 댓글을 남겨보세요!</li>}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
