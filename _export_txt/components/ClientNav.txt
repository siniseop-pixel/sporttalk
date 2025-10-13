// src/components/ClientNav.jsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient.js';

export default function ClientNav() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub?.subscription?.unsubscribe();
  }, []);

  async function onLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <nav className="max-w-5xl mx-auto px-4 h-14 md:h-16 flex items-center gap-4">
      <a href="/" className="font-bold text-base md:text-lg text-brand-700 tracking-tight">
         Sporttalk
      </a>
      <a href="/boards" className="text-sm text-gray-700">
        Boards
      </a>
      <span className="flex-1" />
      {user ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 truncate max-w-[160px]" title={user.email}>
            {user.email}
          </span>
          <button
            onClick={onLogout}
            className="text-sm px-3 py-1 rounded border active:scale-95"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <>
          <a href="/auth" className="text-sm">
            로그인
          </a>
          <a href="/auth?mode=signup" className="text-sm">
            회원가입
          </a>
        </>
      )}
    </nav>
  );
}
