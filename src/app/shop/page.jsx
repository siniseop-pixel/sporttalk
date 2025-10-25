// src/app/shop/page.jsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import ShopClient from './ShopClient.jsx';

export default function ShopPage() {
  return <ShopClient />;
}
