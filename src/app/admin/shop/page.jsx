// src/app/admin/shop/page.jsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import ShopAdminClient from './ShopAdminClient.jsx';

export default function ShopAdminPage() {
  return <ShopAdminClient />;
}
