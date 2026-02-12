'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { LineChart } from '@/components/ui/LineChart';
import { BarChart } from '@/components/ui/BarChart';
import { PieChart } from '@/components/ui/PieChart';
import {
  BuildingOfficeIcon,
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

export default function DistrictDashboard() {
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
        const hasAccess = session.user.role === USER_ROLES.DISTRICT_OFFICER || 
                          session.user.role === USER_ROLES.ADMIN || 
                          session.user.role === USER_ROLES.NATIONAL_OFFICER;
        if (!hasAccess) {
          window.location.href = '/dashboard';
          return;
        }

        try {
          const [statsRes, trendRes, diseaseRes] = await Promise.all([
            fetch('/api/dashboard?type=district'),
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

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please sign in to access the dashboard</p>
        </div>
      </div>
    );
  }

  const districtName = session.user.district?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'District';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <MapPinIcon className="h-6 w-6 text-blue-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{districtName} Dashboard</h1>
          <p className="text-gray-600">Overview of surveillance activities in your district</p>
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
            <div className="p-3 rounded-lg bg-yellow-100">
              <DocumentTextIcon className="h-6 w-6 text-yellow-700" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Pending Cases</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingCases}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-700" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Active Alerts</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.alerts}</p>
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
      </div>

      {/* Case Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Validation</h3>
            <span className="text-2xl font-bold text-yellow-600">{stats.pendingCases}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-yellow-600 h-2 rounded-full" 
              style={{ width: `${stats.totalCases > 0 ? (stats.pendingCases / stats.totalCases) * 100 : 0}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Require district validation</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Validated</h3>
            <span className="text-2xl font-bold text-green-600">{stats.validatedCases}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${stats.totalCases > 0 ? (stats.validatedCases / stats.totalCases) * 100 : 0}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Confirmed cases</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Rejected</h3>
            <span className="text-2xl font-bold text-red-600">{stats.rejectedCases}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-600 h-2 rounded-full" 
              style={{ width: `${stats.totalCases > 0 ? (stats.rejectedCases / stats.totalCases) * 100 : 0}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Invalid reports</p>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard/validation'}>
          <div className="text-center">
            <DocumentTextIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Validate Cases</h3>
            <p className="text-sm text-gray-600">Review pending cases</p>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard/cases'}>
          <div className="text-center">
            <DocumentTextIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">View Cases</h3>
            <p className="text-sm text-gray-600">Browse all cases</p>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard/alert'}>
          <div className="text-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Alerts</h3>
            <p className="text-sm text-gray-600">Monitor alerts</p>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard/facility'}>
          <div className="text-center">
            <BuildingOfficeIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Facilities</h3>
            <p className="text-sm text-gray-600">View facilities</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
