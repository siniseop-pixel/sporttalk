// src/app/boards/attendance/AttendanceBoardClient.jsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient.js'
import VoteButton from '@/components/VoteButton.jsx'
import LikeButton from '@/components/LikeButton.jsx'
import ViewCounter from '@/components/ViewCounter.jsx'
import AttendanceForm from './AttendanceForm.jsx'

export default function AttendanceBoardClient({ posts }) {
  const [attendancePosts, setAttendancePosts] = useState(posts)

  const commentCount = (row) =>
    Array.isArray(row.comments) ? row.comments[0]?.count ?? 0 : 0

  const handleNewAttendance = (newPost) => {
    setAttendancePosts(prev => [newPost, ...prev])
  }

  if (!attendancePosts.length) {
    return (
      <div className="space-y-4">
        <AttendanceForm onSuccess={handleNewAttendance} />
        <div className="text-gray-600">아직 출석 게시글이 없어요. 첫 출석을 해보세요!</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AttendanceForm onSuccess={handleNewAttendance} />
      
      <ul className="space-y-3">
        {attendancePosts.map((p) => (
          <li key={p.id} className="rounded-xl border p-3">
            <Link href={`/boards/attendance/${p.id}`} className="no-underline hover:underline">
              <div className="font-semibold">{p.title}</div>
            </Link>

            <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
              <span>{p.nickname || '익명'} · {new Date(p.created_at).toLocaleString()}</span>
              {p.is_pinned ? <span className="text-amber-700">📌 고정</span> : null}
              <ViewCounter postId={p.id} initial={p.view_count ?? 0} />
            </div>

            <div className="mt-3 flex items-center gap-4">
              <VoteButton postId={p.id} count={p.upvote_count ?? 0} />
              <LikeButton postId={p.id} initialCount={p.like_count ?? 0} />
              <Link
                href={`/boards/attendance/${p.id}#comments`}
                className="text-xs text-gray-600 hover:underline"
              >
                댓글 {commentCount(p)}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

