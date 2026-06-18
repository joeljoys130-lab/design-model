import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * /dashboard is kept for backwards-compatibility.
 * The full dashboard portal lives at / (App Router).
 */
export default function DashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <p className="text-neutral-400 text-sm">Redirecting to dashboard…</p>
    </div>
  );
}
