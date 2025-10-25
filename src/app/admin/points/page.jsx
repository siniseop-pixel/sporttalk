// src/app/admin/points/page.jsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import AdminPointsClient from './AdminPointsClient.jsx';

export default function AdminPointsPage() {
  return <AdminPointsClient />;
}
