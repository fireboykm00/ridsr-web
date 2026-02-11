import { auth } from '@/lib/auth';
import { DashboardStats, DashboardMetrics, DashboardChartData } from '@/types';

export async function getDashboardData(): Promise<DashboardStats> {
  const session = await auth();
  if (!session?.user) throw new Error('User not authenticated');

  const res = await fetch('/api/dashboard');
  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  return res.json();
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const session = await auth();
  if (!session?.user) throw new Error('User not authenticated');

  const res = await fetch('/api/dashboard/metrics');
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

export async function getDashboardCharts(): Promise<Record<string, DashboardChartData[]>> {
  const session = await auth();
  if (!session?.user) throw new Error('User not authenticated');

  const res = await fetch('/api/dashboard/charts');
  if (!res.ok) throw new Error('Failed to fetch charts');
  return res.json();
}
