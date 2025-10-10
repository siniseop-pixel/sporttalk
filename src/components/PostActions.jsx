'use client'
export default function PostActions({ post, slug }) {
  // TODO: 권한 체크 후 버튼 노출
  return (
    <div className="flex gap-2">
      <button className="text-xs px-2 py-1 rounded border">고정</button>
      <button className="text-xs px-2 py-1 rounded border">삭제</button>
    </div>
  )
}
