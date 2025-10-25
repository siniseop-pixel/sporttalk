'use client'
import { useState } from 'react'
import CommentList from './CommentList.jsx'
import CommentBox from './CommentBox.jsx'

export default function CommentSection({ postId }) {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCommentAdded = () => {
    // 댓글 추가 시 목록 새로고침 트리거
    setRefreshKey(prev => prev + 1)
  }

  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold mb-2">댓글</h2>
      <CommentList postId={postId} onRefresh={refreshKey} />
      <CommentBox postId={postId} onCommentAdded={handleCommentAdded} />
    </section>
  )
}

