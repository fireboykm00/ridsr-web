import { DashboardStats } from '@/types';
import { throwApiError } from '@/lib/utils/apiError';

export async function getDashboardData(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard', {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) await throwApiError(res, 'Failed to fetch dashboard data');
  const responseData = await res.json();
  return responseData.data || responseData;
}
