// src/app/boards/[slug]/[postId]/page.jsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import PostClient from './PostClient';

export default function Page({ params }) {
  const { slug, postId } = params;
  return <PostClient slug={slug} postId={postId} />;
}
