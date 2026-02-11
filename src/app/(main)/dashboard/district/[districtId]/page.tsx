// src/app/(main)/dashboard/district/[districtId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import {
  isDistrictOfficer,
} from '@/lib/auth-utils';
import { facilityService } from '@/lib/services/facility-service';
import { userService } from '@/lib/services/user-service';
import { Facility, User, FacilityType } from '@/types';

interface FacilitySummary {
  id: string;
  name: string;
  type: FacilityType;
  totalCases: number;
  activeCases: number;
  lastReport: string;
}

const DistrictDashboard = () => {
  const { data: session, status } = useSession();
  const params = useParams();
  const districtId = params.districtId as string;
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFacilities: 0,
    totalUsers: 0,
    totalCases: 0,
    activeOutbreaks: 0
  });

  useEffect(() => {
    const loadData = async () => {
      if (status === 'authenticated' && session) {
        try {
          // Check if user is a district officer
          const isDistrictOfficerUser = await isDistrictOfficer();
          if (!isDistrictOfficerUser) {
            // Redirect to appropriate dashboard if not a district officer
            window.location.href = '/dashboard';
            return;
          }

          // Get facilities in the district
          const districtFacilities = await facilityService.getFacilitiesByDistrict(districtId);
          setFacilities(districtFacilities);

          // Get users in the district
          const districtUsers = await userService.getUsersByDistrict(districtId);
          setUsers(districtUsers);

          // Calculate stats
          setStats({
            totalFacilities: districtFacilities.length,
            totalUsers: districtUsers.length,
            totalCases: Math.floor(Math.random() * 100), // Mock data
            activeOutbreaks: Math.floor(Math.random() * 10) // Mock data
          });
        } catch (error) {
          console.error('Error loading district data:', error);
          // Handle unauthorized access
          if ((error as Error).message.includes('permissions')) {
            window.location.href = '/dashboard';
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [status, session, districtId]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You must be signed in to view this page
          </p>
          <a
            href="/login"
            className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors inline-block"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  // Mock data for facility summaries
  const facilitySummaries: FacilitySummary[] = facilities.map((facility, index) => ({
    id: facility.id,
    name: facility.name,
    type: facility.type,
    totalCases: Math.floor(Math.random() * 50),
    activeCases: Math.floor(Math.random() * 10),
    lastReport: `2024-01-${20 + index}`
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MapPinIcon className="h-6 w-6 text-blue-700" />
            <h1 className="text-2xl font-bold text-gray-900">
              District Dashboard: {districtId}
            </h1>
          </div>
          <p className="text-gray-600">
            Overview of health facilities and cases in your district
          </p>
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
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Active Outbreaks</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.activeOutbreaks}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Facilities Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Facilities in {districtId}</h3>
            <div className="space-y-4">
              {facilitySummaries.map((facility) => (
                <div key={facility.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{facility.name}</h4>
                      <p className="text-sm text-gray-600">{facility.type}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {facility.activeCases} active
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Total Cases</p>
                      <p className="font-medium">{facility.totalCases}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Last Report</p>
                      <p className="font-medium">{facility.lastReport}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <p className="font-medium text-green-600">Active</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Workers</h3>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                  <div>
                    <h4 className="font-medium text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.role.replace('_', ' ')}</p>
                  </div>
                  <span className="text-sm text-gray-500">{user.facilityId}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <DocumentTextIcon className="h-4 w-4 text-blue-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New case reported</p>
                  <p className="text-sm text-gray-600">From Kigali Central Hospital • 2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DistrictDashboard;