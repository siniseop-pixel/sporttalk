'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient.js';

export default function LikeButton({ postId, initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);   // 첫 렌더용만 사용, 곧바로 DB값으로 대체
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  // 현재 로그인 유저 id
  const getUserId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null; // uuid
  }, []);

  // DB에서 총개수 + 내 좋아요 여부 재조회
  const refresh = useCallback(async () => {
    setErr(null);
    const uid = await getUserId();

    // 총 개수
    const totalQ = supabase
      .from('post_likes')
      .select('*', { head: true, count: 'exact' })
      .eq('post_id', String(postId));

    // 내 좋아요 여부
    const mineQ = uid
      ? supabase
          .from('post_likes')
          .select('*', { head: true, count: 'exact' })
          .eq('post_id', String(postId))
          .eq('user_id', uid)
      : null;

    const [totalRes, mineRes] = await Promise.all([totalQ, mineQ]);
    if (totalRes.error) setErr(totalRes.error.message);
    setCount(totalRes.count ?? 0);
    setLiked(((mineRes?.count) ?? 0) > 0);
  }, [getUserId, postId]);

  useEffect(() => {
    let alive = true;
    (async () => { if (alive) await refresh(); })();

    // 로그인 상태 바뀌면 다시 조회
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      if (alive) refresh();
    });

    return () => { alive = false; sub?.subscription?.unsubscribe(); };
  }, [refresh]);

  // 토글
  const toggle = async () => {
    setBusy(true);
    setErr(null);
    try {
      const uid = await getUserId();
      if (!uid) throw new Error('로그인이 필요합니다.');

      if (!liked) {
        // 좋아요 추가 (unique(post_id, user_id))
        const { error } = await supabase
          .from('post_likes')
          .insert([{ post_id: String(postId), user_id: uid }]); // returning 최소화
        if (error) throw error;
      } else {
        // 좋아요 취소
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', String(postId))
          .eq('user_id', uid);
        if (error) throw error;
      }

      // 낙관적 증가/감소 대신 → 실제 DB값 재조회(새로고침해도 유지)
      await refresh();
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={toggle}
        disabled={busy}
        className={`rounded-full border px-3 py-1 text-sm ${
          liked ? 'bg-yellow-50 border-yellow-300' : 'bg-white'
        } ${busy ? 'opacity-60 cursor-not-allowed' : ''}`}
        aria-pressed={liked}
      >
        👍 좋아요 {count}
      </button>
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}
