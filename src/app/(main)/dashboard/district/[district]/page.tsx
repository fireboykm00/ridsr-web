// src/app/(main)/dashboard/district/[district]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  PlusIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { USER_ROLES, RwandaDistrictType } from '@/types';

interface DistrictStats {
  totalFacilities: number;
  totalUsers: number;
  totalCases: number;
  activeCases: number;
  pendingCases: number;
  activeAlerts: number;
}

interface FacilitySummary {
  id: string;
  name: string;
  type: string;
  totalCases: number;
  activeCases: number;
  lastReport: string;
  status: 'active' | 'inactive';
}

interface Alert {
  id: string;
  type: 'outbreak' | 'case_threshold' | 'system';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  isRead: boolean;
}

interface CaseSummary {
  status?: string;
  validationStatus?: string;
}

interface FacilityApiRecord {
  _id?: string;
  id?: string;
  name?: string;
  type?: string;
}

const DistrictDashboard = () => {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const district = params.district as RwandaDistrictType;
  
  const [stats, setStats] = useState<DistrictStats>({
    totalFacilities: 0,
    totalUsers: 0,
    totalCases: 0,
    activeCases: 0,
    pendingCases: 0,
    activeAlerts: 0
  });
  const [facilities, setFacilities] = useState<FacilitySummary[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (status === 'authenticated' && session) {
        try {
          // Check RBAC - district officers can only access their district
          if (session.user?.role === USER_ROLES.DISTRICT_OFFICER && 
              session.user?.district !== district) {
            setError('Access denied. You can only view your assigned district.');
            return;
          }

          // Fetch facilities in district
          const facilitiesResponse = await fetch(`/api/facilities?district=${district}`);
          const facilitiesData = await facilitiesResponse.json();
          const districtFacilities: FacilityApiRecord[] = facilitiesData.data || [];

          // Fetch cases in district
          const casesResponse = await fetch(`/api/cases?district=${district}`);
          const casesData = await casesResponse.json();
          const districtCases: CaseSummary[] = casesData.data?.data || [];

          // Fetch users in district
          const usersResponse = await fetch(`/api/users?district=${district}`);
          const usersData = await usersResponse.json();
          const districtUsers = usersData.data || [];

          // Calculate stats
          setStats({
            totalFacilities: districtFacilities.length,
            totalUsers: districtUsers.length,
            totalCases: districtCases.length,
            activeCases: districtCases.filter((c) => c.status === 'confirmed' || c.status === 'suspected').length,
            pendingCases: districtCases.filter((c) => c.validationStatus === 'pending').length,
            activeAlerts: 0
          });

          setFacilities(districtFacilities.map((facility) => ({
            id: facility._id || facility.id,
            name: facility.name || 'Unknown Facility',
            type: facility.type || 'Unknown',
            totalCases: 0,
            activeCases: 0,
            lastReport: 'N/A',
            status: 'active'
          })));

          // Load active alerts for district
          const alertsResponse = await fetch(`/api/alerts?district=${district}&status=active`);
          if (alertsResponse.ok) {
            const alertsData = await alertsResponse.json();
            setAlerts(alertsData.data.slice(0, 5)); // Show latest 5 alerts
          }

        } catch (error) {
          console.error('Error loading district data:', error);
          setError('Failed to load district data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [status, session, district]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Districts', href: '/dashboard/district' },
    { label: district }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header with Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <MapPinIcon className="h-6 w-6 text-blue-700" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {district} District Dashboard
                </h1>
                <p className="text-gray-600">
                  Overview of health facilities and disease surveillance
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/dashboard/district/${district}/report-case`}>
                <Button variant="primary" className="flex items-center gap-2">
                  <PlusIcon className="h-4 w-4" />
                  Report Case
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Facilities</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFacilities}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <UserGroupIcon className="h-6 w-6 text-green-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Health Workers</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100">
                <DocumentTextIcon className="h-6 w-6 text-yellow-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Cases</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCases}</p>
                <p className="text-sm text-gray-600">{stats.activeCases} active</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100">
                <BellIcon className="h-6 w-6 text-red-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.activeAlerts}</p>
                <p className="text-sm text-gray-600">{stats.pendingCases} pending</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Facilities List */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Health Facilities</h3>
              <Link href={`/dashboard/facilities?district=${district}`}>
                <Button variant="secondary" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {facilities.length > 0 ? (
                facilities.slice(0, 5).map((facility) => (
                  <div key={facility.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{facility.name}</h4>
                        <p className="text-sm text-gray-600">{facility.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          facility.activeCases > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {facility.activeCases} active
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          facility.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {facility.status}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Cases</p>
                        <p className="font-medium">{facility.totalCases}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Last Report</p>
                        <p className="font-medium">{facility.lastReport}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No facilities found</p>
              )}
            </div>
          </Card>

          {/* Cases by Facility */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cases by Facility</h3>
              <Link href={`/dashboard/cases?district=${district}`}>
                <Button variant="secondary" size="sm">View All Cases</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {facilities
                .filter(f => f.totalCases > 0)
                .sort((a, b) => b.totalCases - a.totalCases)
                .slice(0, 5)
                .map((facility) => (
                  <div key={facility.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{facility.name}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min((facility.totalCases / Math.max(...facilities.map(f => f.totalCases))) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-bold text-gray-900">{facility.totalCases}</p>
                      <p className="text-sm text-gray-600">{facility.activeCases} active</p>
                    </div>
                  </div>
                ))}
              {facilities.filter(f => f.totalCases > 0).length === 0 && (
                <p className="text-gray-500 text-center py-4">No cases reported yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Alerts Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
            <Link href={`/dashboard/alerts?district=${district}`}>
              <Button variant="secondary" size="sm">View All Alerts</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className={`p-2 rounded-full ${
                    alert.severity === 'critical' ? 'bg-red-100' :
                    alert.severity === 'high' ? 'bg-orange-100' :
                    alert.severity === 'medium' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    <BellIcon className={`h-4 w-4 ${
                      alert.severity === 'critical' ? 'text-red-700' :
                      alert.severity === 'high' ? 'text-orange-700' :
                      alert.severity === 'medium' ? 'text-yellow-700' :
                      'text-blue-700'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{alert.type.replace('_', ' ')}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.createdAt}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No active alerts</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DistrictDashboard;
