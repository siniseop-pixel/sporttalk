'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default function BoardClient({ slug }) {
  const [posts, setPosts] = useState(null);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    const supabase = getAnonClient();
    if (!supabase) {
      setErrMsg('환경변수(NEXT_PUBLIC_SUPABASE_*)가 비어 있습니다.');
      setPosts([]);
      return;
    }

    supabase
      .from('posts')
      .select('id, title, created_at, nickname, like_count, comment_count, view_count, slug')
      .eq('slug', slug)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) {
          // ✅ dev 오버레이 피하려고 error 대신 warn/log 사용
          console.warn('[boards/[slug]] fetch error:', error);
          setErrMsg(error.message || '게시글 로드 오류');
          setPosts([]);
          return;
        }
        setPosts(data ?? []);
      });
  }, [slug]);

  if (posts === null) return <div className="p-4 text-sm">불러오는 중…</div>;

  return (
    <div className="grid gap-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-xl font-bold">#{slug}</h2>
        <Link href={`/boards/${slug}/write`} className="text-sm px-2 py-1 border rounded active:scale-95">
          글쓰기
        </Link>
      </div>

      {errMsg && (
        <div className="text-sm text-red-600 border border-red-200 bg-red-50 p-2 rounded">
          {errMsg}
        </div>
      )}

      {!posts.length ? (
        <div className="text-sm text-gray-600">아직 게시글이 없어요. 첫 글을 남겨보세요!</div>
      ) : (
        <ul className="card divide-y">
          {posts.map((p) => (
            <li key={p.id} className="p-3 md:p-4">
              <Link href={`/boards/${slug}/${p.id}`} className="font-medium">
                {p.title}
              </Link>
              <div className="text-xs text-gray-500 mt-1 flex gap-3">
                <span>{p.nickname || '익명'}</span>
                <span>{new Date(p.created_at).toLocaleString()}</span>
                <span>👍 {p.like_count ?? p.likes_count ?? 0}</span>
                <span>💬 {p.comment_count ?? p.comments_count ?? 0}</span>
                <span>👁️ {p.view_count ?? p.views ?? 0}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
