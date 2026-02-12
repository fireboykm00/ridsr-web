import { DashboardStats } from '@/types';

export async function getDashboardData(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard', {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  const responseData = await res.json();
  return responseData.data || responseData;
}
