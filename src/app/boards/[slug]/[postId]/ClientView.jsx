'use client'

import { useSearchParams } from 'next/navigation'

export default function ClientView({ params }) {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  return (
    <div style={{ padding: 20 }}>
      <h2>게시판 페이지</h2>
      <p>
        slug: <b>{params.slug}</b>
        <br />
        postID: <b>{params.postID}</b>
        <br />
        query: <b>{query}</b>
      </p>
    </div>
  )
}