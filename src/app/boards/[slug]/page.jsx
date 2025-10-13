// src/app/boards/[slug]/page.jsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import BoardClient from './BoardClient';

export default function BoardList({ params: { slug } }) {
  return <BoardClient slug={slug} />;
}
