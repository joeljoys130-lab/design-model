import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAccessToken } from '@/lib/auth/jwt';
import {
  getEntriesAction,
  getCementLoadsAction,
  getTarLoadsAction,
  getStockRegisterAction,
  getSiteMaterialsAction,
  getWorkBasedEntriesAction,
  getPrivateWorksAction,
} from './actions';
import DashboardPortal from '@/components/dashboard-portal';

export default async function Page() {
  // ── Auth guard ──────────────────────────────────────────────────
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token || !verifyAccessToken(token)) {
    redirect('/login');
  }

  // Decode user from JWT (no DB needed for basic info)
  const decoded = verifyAccessToken(token) as any;
  const user = {
    id:    decoded.id    ?? 'u-1',
    email: decoded.email ?? 'user@buildcorp.com',
    role:  decoded.role  ?? 'ADMIN',
    name:  decoded.name  ?? decoded.email?.split('@')[0] ?? 'User',
  };

  // ── Fetch initial data ──────────────────────────────────────────
  const [
    entries,
    cementLoads,
    tarLoads,
    stockRegister,
    siteMaterials,
    workBasedEntries,
    privateWorks,
  ] = await Promise.all([
    getEntriesAction(),
    getCementLoadsAction(),
    getTarLoadsAction(),
    getStockRegisterAction(),
    getSiteMaterialsAction(),
    getWorkBasedEntriesAction(),
    getPrivateWorksAction(),
  ]);

  const initialData = {
    entries,
    cementLoads,
    tarLoads,
    stockRegister,
    siteMaterials,
    workBasedEntries,
    privateWorks,
  };

  return <DashboardPortal initialUser={user} initialData={initialData} />;
}
