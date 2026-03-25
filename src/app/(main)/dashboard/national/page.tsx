'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { LineChart } from '@/components/ui/LineChart';
import { BarChart } from '@/components/ui/BarChart';
import { PieChart } from '@/components/ui/PieChart';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { USER_ROLES } from '@/types';

interface DashboardStats {
  totalCases: number;
  pendingCases: number;
  validatedCases: number;
  rejectedCases: number;
  alerts: number;
  totalFacilities: number;
  totalUsers: number;
  activeOutbreaks: number;
}

function unwrapApiData<T>(payload: unknown, fallback: T): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return ((payload as { data?: T }).data ?? fallback) as T;
  }
  return (payload as T) ?? fallback;
}

export default function NationalDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    pendingCases: 0,
    validatedCases: 0,
    rejectedCases: 0,
    alerts: 0,
    totalFacilities: 0,
    totalUsers: 0,
    activeOutbreaks: 0,
  });
  const [trendData, setTrendData] = useState<Array<{ name: string; value: number }>>([]);
  const [diseaseData, setDiseaseData] = useState<Array<{ name: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (status !== 'authenticated' || !session?.user) return;

      const hasAccess =
        session.user.role === USER_ROLES.ADMIN || session.user.role === USER_ROLES.NATIONAL_OFFICER;
      if (!hasAccess) {
        window.location.href = '/dashboard';
        return;
      }

      try {
        const [statsRes, trendRes, diseaseRes] = await Promise.all([
          fetch('/api/dashboard?type=national'),
          fetch('/api/dashboard?type=trend&days=30'),
          fetch('/api/dashboard?type=diseases'),
        ]);

        if (statsRes.ok) {
          const payload = await statsRes.json();
          setStats(unwrapApiData<DashboardStats>(payload, {
            totalCases: 0,
            pendingCases: 0,
            validatedCases: 0,
            rejectedCases: 0,
            alerts: 0,
            totalFacilities: 0,
            totalUsers: 0,
            activeOutbreaks: 0,
          }));
        }
        if (trendRes.ok) {
          const payload = await trendRes.json();
          const trend = unwrapApiData<Array<{ _id?: string; count?: number }>>(payload, []);
          setTrendData(trend.map((item) => ({
            name: item._id || '',
            value: item.count || 0,
          })));
        }
        if (diseaseRes.ok) {
          const payload = await diseaseRes.json();
          const diseases = unwrapApiData<Array<{ _id?: string; count?: number }>>(payload, []);
          setDiseaseData(diseases.map((item) => ({
            name: item._id || 'Unknown',
            value: item.count || 0,
          })));
        }
      } catch (error) {
        console.error('Error loading national dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [status, session]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session?.user || (session.user.role !== USER_ROLES.ADMIN && session.user.role !== USER_ROLES.NATIONAL_OFFICER)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-md bg-muted border border-border p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="uppercase tracking-[0.2em] text-xs text-primary font-semibold mb-2">National Command Center</p>
            <h1 className="text-3xl font-bold text-foreground">Rwanda Surveillance Overview</h1>
            <p className="text-muted-foreground mt-2 text-sm">Live signal across cases, facilities, users, and validation throughput.</p>
          </div>
          <MapPinIcon className="h-12 w-12 text-primary" />
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Cases</p>
          <p className="text-3xl font-bold text-foreground">{stats.totalCases}</p>
          <p className="text-xs text-muted-foreground mt-1">{stats.pendingCases} pending review</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Facilities</p>
          <p className="text-3xl font-bold text-foreground">{stats.totalFacilities}</p>
          <p className="text-xs text-muted-foreground mt-1">Nationwide reporting units</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Alerts</p>
          <p className="text-3xl font-bold text-foreground">{stats.alerts}</p>
          <p className="text-xs text-muted-foreground mt-1">Escalation signals</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Users</p>
          <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
          <p className="text-xs text-muted-foreground mt-1">Active surveillance staff</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ChartBarIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">30-Day Trend</h3>
          </div>
          <LineChart data={trendData} />
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <DocumentTextIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Disease Mix</h3>
          </div>
          <BarChart data={diseaseData} />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ExclamationTriangleIcon className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">Validation Distribution</h3>
          </div>
          <PieChart
            data={[
              { name: 'Pending', value: stats.pendingCases },
              { name: 'Validated', value: stats.validatedCases },
              { name: 'Rejected', value: stats.rejectedCases },
            ]}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Operational Snapshot</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-muted rounded-md p-4">
              <div className="flex items-center gap-2 text-foreground text-sm">
                <BuildingOfficeIcon className="h-5 w-5 text-primary" />
                Facility reporting coverage
              </div>
              <span className="font-semibold text-foreground">{stats.totalFacilities}</span>
            </div>
            <div className="flex items-center justify-between bg-muted rounded-md p-4">
              <div className="flex items-center gap-2 text-foreground text-sm">
                <UserGroupIcon className="h-5 w-5 text-primary" />
                Surveillance workforce
              </div>
              <span className="font-semibold text-foreground">{stats.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between bg-muted rounded-md p-4">
              <div className="flex items-center gap-2 text-foreground text-sm">
                <DocumentTextIcon className="h-5 w-5 text-primary" />
                Open case volume
              </div>
              <span className="font-semibold text-foreground">{stats.pendingCases}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
