// src/app/boards/attendance/page.jsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { notFound } from 'next/navigation';
import { getServerClient } from '@/lib/supabaseServer.js';

// 클라이언트 컴포넌트들
import HeaderBreadcrumb from '@/components/HeaderBreadcrumb.jsx';
import AttendanceBoardClient from './AttendanceBoardClient.jsx';

export default async function AttendancePage() {
  const supabase = getServerClient();
  if (!supabase) notFound();

  // 출석 게시판의 게시글들 가져오기
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      id, slug, title, nickname, author_id, created_at, is_pinned,
      like_count, upvote_count, view_count,
      comments:comments(count)
    `)
    .eq('slug', 'attendance')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[attendance posts select error]', error);
    notFound();
  }

  return (
    <>
      <HeaderBreadcrumb />
      
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">출석 게시판</h1>
          <p className="text-gray-600">
            매일 출석하여 포인트를 획득하세요! 
            <br />
            • 일일 출석: 100P
            <br />
            • 7일 연속 출석: 추가 300P (총 1000P)
          </p>
        </div>

        <AttendanceBoardClient posts={posts || []} />
      </main>
    </>
  );
}

