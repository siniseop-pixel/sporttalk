// src/app/boards/[slug]/page.jsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import BoardClient from './BoardClient';

export default async function BoardList({ params }) {
  const { slug } = await params;
  return <BoardClient slug={slug} />;
}
