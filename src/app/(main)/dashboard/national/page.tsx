'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { USER_ROLES } from '@/types';

interface NationalStats {
  totalFacilities: number;
  totalUsers: number;
  totalCases: number;
  activeOutbreaks: number;
  totalDistricts: number;
  totalProvinces: number;
}

interface District {
  id: string;
  name: string;
  cases: number;
  facilities: number;
}

export default function NationalDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<NationalStats>({
    totalFacilities: 0,
    totalUsers: 0,
    totalCases: 0,
    activeOutbreaks: 0,
    totalDistricts: 30,
    totalProvinces: 5
  });
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (status === 'authenticated' && session) {
        // Check if user has access
        const hasAccess = [USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER].includes(session.user?.role as string);
        if (!hasAccess) {
          window.location.href = '/dashboard';
          return;
        }

        try {
          // TODO: Fetch from API
          setStats({
            totalFacilities: 450,
            totalUsers: 1200,
            totalCases: 3450,
            activeOutbreaks: 12,
            totalDistricts: 30,
            totalProvinces: 5
          });

          // Mock districts data
          setDistricts([
            { id: 'gasabo', name: 'Gasabo', cases: 145, facilities: 15 },
            { id: 'kicukiro', name: 'Kicukiro', cases: 98, facilities: 12 },
            { id: 'nyarugenge', name: 'Nyarugenge', cases: 167, facilities: 18 },
            { id: 'bugesera', name: 'Bugesera', cases: 56, facilities: 8 },
            { id: 'kamonyi', name: 'Kamonyi', cases: 89, facilities: 10 },
          ]);
        } catch (error) {
          console.error('Error loading national data:', error);
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

  if (!session || ![USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER].includes(session.user?.role as string)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MapPinIcon className="h-6 w-6 text-blue-700" />
            <h1 className="text-2xl font-bold text-gray-900">National Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Overview of disease surveillance across all districts
          </p>
        </div>

        {/* National Stats */}
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
                <h3 className="text-lg font-semibold text-gray-900">Users</h3>
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
                <h3 className="text-lg font-semibold text-gray-900">Cases</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCases}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Outbreaks</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.activeOutbreaks}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Districts Overview */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Districts Overview</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">District</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Cases</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Facilities</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {districts.map((district) => (
                  <tr key={district.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{district.name}</td>
                    <td className="py-3 px-4 text-gray-900">{district.cases}</td>
                    <td className="py-3 px-4 text-gray-900">{district.facilities}</td>
                    <td className="py-3 px-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.location.href = `/dashboard/district/${district.id}`}
                        className="flex items-center gap-2"
                      >
                        View <ArrowRightIcon className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
