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
  ChartBarIcon
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
    activeOutbreaks: 0
  });
  const [trendData, setTrendData] = useState([]);
  const [diseaseData, setDiseaseData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (status === 'authenticated' && session?.user) {
        const hasAccess = session.user.role === USER_ROLES.ADMIN || session.user.role === USER_ROLES.NATIONAL_OFFICER;
        if (!hasAccess) {
          window.location.href = '/dashboard';
          return;
        }

        try {
          const [statsRes, trendRes, diseaseRes] = await Promise.all([
            fetch('/api/dashboard?type=national'),
            fetch('/api/dashboard?type=trend&days=30'),
            fetch('/api/dashboard?type=diseases')
          ]);

          if (statsRes.ok) {
            const data = await statsRes.json();
            setStats(data);
          }

          if (trendRes.ok) {
            const data = await trendRes.json();
            setTrendData(data);
          }

          if (diseaseRes.ok) {
            const data = await diseaseRes.json();
            setDiseaseData(data);
          }
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [status, session]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!session?.user || (session.user.role !== USER_ROLES.ADMIN && session.user.role !== USER_ROLES.NATIONAL_OFFICER)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to view this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <MapPinIcon className="h-6 w-6 text-blue-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">National Dashboard</h1>
          <p className="text-gray-600">Overview of disease surveillance across Rwanda</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <DocumentTextIcon className="h-6 w-6 text-blue-700" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Total Cases</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCases}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <BuildingOfficeIcon className="h-6 w-6 text-green-700" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Facilities</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalFacilities}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-700" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Active Alerts</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.alerts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <UserGroupIcon className="h-6 w-6 text-purple-700" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">System Users</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Case Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Cases</h3>
            <span className="text-2xl font-bold text-yellow-600">{stats.pendingCases}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-yellow-600 h-2 rounded-full" 
              style={{ width: `${stats.totalCases > 0 ? (stats.pendingCases / stats.totalCases) * 100 : 0}%` }}
            ></div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Validated Cases</h3>
            <span className="text-2xl font-bold text-green-600">{stats.validatedCases}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${stats.totalCases > 0 ? (stats.validatedCases / stats.totalCases) * 100 : 0}%` }}
            ></div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Rejected Cases</h3>
            <span className="text-2xl font-bold text-red-600">{stats.rejectedCases}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-600 h-2 rounded-full" 
              style={{ width: `${stats.totalCases > 0 ? (stats.rejectedCases / stats.totalCases) * 100 : 0}%` }}
            ></div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ChartBarIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cases Trend (30 Days)</h3>
          </div>
          <LineChart data={trendData} />
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ChartBarIcon className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cases by Disease</h3>
          </div>
          <BarChart data={diseaseData} />
        </Card>
      </div>

      {/* Case Status Distribution */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ChartBarIcon className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Case Status Distribution</h3>
        </div>
        <PieChart 
          data={[
            { name: 'Pending', value: stats.pendingCases, color: '#EAB308' },
            { name: 'Validated', value: stats.validatedCases, color: '#16A34A' },
            { name: 'Rejected', value: stats.rejectedCases, color: '#DC2626' }
          ]} 
        />
      </Card>
    </div>
  );
}
