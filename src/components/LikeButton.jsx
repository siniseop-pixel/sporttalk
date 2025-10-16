'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient.js';

export default function LikeButton({ postId, initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  // 로그인 사용자 id 얻기
  async function getUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null; // Supabase v2: user.id는 uuid
  }

  // ✅ 현재 사용자가 좋아요 했는지 확인 (id 컬럼 조회 금지)
  useEffect(() => {
    let alive = true;
    (async () => {
      setErr(null);
      const uid = await getUserId();
      if (!uid) return; // 비로그인 사용자는 기본 false
      const { count: c, error } = await supabase
        .from('post_likes')
        .select('*', { head: true, count: 'exact' })
        .eq('post_id', postId)
        .eq('user_id', uid);

      if (!alive) return;
      if (error) setErr(error.message);
      else setLiked((c ?? 0) > 0);
    })();
    return () => { alive = false; };
  }, [postId]);

  // ✅ 토글
  async function toggle() {
    setBusy(true);
    setErr(null);
    try {
      const uid = await getUserId();
      if (!uid) throw new Error('로그인이 필요합니다.');

      if (!liked) {
        // 좋아요 추가 (복합 PK: post_id + user_id)
        const { error } = await supabase
          .from('post_likes')
          .insert([{ post_id: postId, user_id: uid }]); // returning 불필요

        if (error) throw error;
        setLiked(true);
        setCount((v) => v + 1);
      } else {
        // 좋아요 취소
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', uid);

        if (error) throw error;
        setLiked(false);
        setCount((v) => Math.max(0, v - 1));
      }
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={toggle}
        disabled={busy}
        className={`rounded-full border px-3 py-1 text-sm ${liked ? 'bg-yellow-50 border-yellow-300' : 'bg-white'}`}
        aria-pressed={liked}
      >
        👍 좋아요 {count}
      </button>
      {err && (
        <span className="text-xs text-red-600">
          {err}
        </span>
      )}
    </div>
  );
}
