'use client'
export default function PostActions({ post, slug }) {
  return (
    <div className="flex gap-2 mt-2">
      <button
        className="text-xs px-2 py-1 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 active:scale-95"
      >
        고정
      </button>
      <button
        className="text-xs px-2 py-1 rounded-md border border-red-300 bg-red-50 hover:bg-red-100 active:scale-95"
      >
        삭제
      </button>
    </div>
  )
}
