'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default function BoardsClient() {
  const [boards, setBoards] = useState([]);

  useEffect(() => {
    const supabase = getAnonClient();
    if (!supabase) return;

    supabase
      .from('boards')
      .select('*')
      .order('sort_index', { ascending: true })
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error('Error fetching boards:', error.message);
        setBoards(data ?? []);
      });
  }, []);

  const themes = {
    swimming: { icon: '🏊', bg: 'bg-blue-50', text: 'text-blue-700', hover: 'hover:bg-blue-100' },
    soccer: { icon: '⚽', bg: 'bg-gray-100', text: 'text-gray-900', hover: 'hover:bg-gray-200' },
    basketball: { icon: '🏀', bg: 'bg-orange-50', text: 'text-orange-700', hover: 'hover:bg-orange-100' },
    baseball: { icon: '⚾', bg: 'bg-gray-50', text: 'text-gray-700', hover: 'hover:bg-gray-100' },
    tennis: { icon: '🎾', bg: 'bg-lime-50', text: 'text-lime-700', hover: 'hover:bg-lime-100' },
    badminton: { icon: '🏸', bg: 'bg-pink-50', text: 'text-pink-700', hover: 'hover:bg-pink-100' },
    fitness: { icon: '💪', bg: 'bg-gray-50', text: 'text-gray-700', hover: 'hover:bg-gray-100' },
    running: { icon: '🏃', bg: 'bg-cyan-50', text: 'text-cyan-700', hover: 'hover:bg-cyan-100' },
    climbing: { icon: '🧗', bg: 'bg-purple-50', text: 'text-purple-700', hover: 'hover:bg-purple-100' },
    golf: { icon: '⛳', bg: 'bg-green-50', text: 'text-green-700', hover: 'hover:bg-green-100' },
    volleyball: { icon: '🏐', bg: 'bg-yellow-50', text: 'text-yellow-700', hover: 'hover:bg-yellow-100' },
    cycling: { icon: '🚴', bg: 'bg-blue-50', text: 'text-blue-700', hover: 'hover:bg-blue-100' },
    tabletennis: { icon: '🏓', bg: 'bg-orange-50', text: 'text-orange-700', hover: 'hover:bg-orange-100' },
    wintersports: { icon: '⛷️', bg: 'bg-sky-50', text: 'text-sky-700', hover: 'hover:bg-sky-100' },
  };

  return (
    <main>
      <h1 className="text-xl md:text-2xl font-bold">생활체육 커뮤니티</h1>
      <p className="text-gray-600 mt-1 text-sm md:text-base">관심 있는 종목을 선택하세요</p>

      <div className="grid gap-3 md:gap-4 mt-4 md:mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((b) => {
          const t =
            themes[b.slug] ||
            { icon: '🏅', bg: 'bg-gray-50', text: 'text-gray-700', hover: 'hover:bg-gray-100' };

          return (
            <a
              key={b.id}
              href={`/boards/${b.slug}`}
              className={`card ${t.bg} ${t.hover} transition flex items-center gap-3 md:gap-4 p-3 md:p-4 active:scale-[0.99]`}
            >
              <div className={`text-2xl md:text-3xl ${t.text}`}>{t.icon}</div>
              <div className="min-w-0">
                <div className={`font-semibold text-base md:text-lg truncate ${t.text}`}>{b.name}</div>
                <div className="text-[11px] md:text-xs text-gray-500 truncate">#{b.slug}</div>
              </div>
            </a>
          );
        })}
      </div>
    </main>
  );
}
