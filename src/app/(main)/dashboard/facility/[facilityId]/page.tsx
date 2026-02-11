// src/app/(main)/dashboard/facility/[facilityId]/page.tsx
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
  canAccessFacility
} from '@/lib/auth-utils';
import { facilityService } from '@/lib/services/facility-service';
import { userService } from '@/lib/services/user-service';
import { Facility, User, CaseStatus } from '@/types';

interface CaseSummary {
  id: string;
  patientName: string;
  disease: string;
  status: CaseStatus;
  date: string;
}

const FacilityDashboard = () => {
  const { data: session, status } = useSession();
  const params = useParams();
  const facilityId = params.facilityId as string;
  const [facility, setFacility] = useState<Facility | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCases: 0,
    pendingCases: 0,
    confirmedCases: 0,
    resolvedCases: 0
  });

  useEffect(() => {
    const loadData = async () => {
      if (status === 'authenticated' && session) {
        try {
          // Check if user can access this facility
          const hasAccess = await canAccessFacility(facilityId);
          if (!hasAccess) {
            // Redirect to appropriate dashboard if no access
            window.location.href = '/dashboard';
            return;
          }

          // Get facility details
          const facilityDetails = await facilityService.getFacilityById(facilityId);
          setFacility(facilityDetails);

          // Get users at this facility
          const facilityUsers = await userService.getUsersByFacility(facilityId);
          setUsers(facilityUsers);

          // Calculate stats
          setStats({
            totalCases: Math.floor(Math.random() * 50), // Mock data
            pendingCases: Math.floor(Math.random() * 15), // Mock data
            confirmedCases: Math.floor(Math.random() * 20), // Mock data
            resolvedCases: Math.floor(Math.random() * 15) // Mock data
          });
        } catch (error) {
          console.error('Error loading facility data:', error);
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
  }, [status, session, facilityId]);

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

  // Mock data for cases
  const cases: CaseSummary[] = [
    { id: '1', patientName: 'John Doe', disease: 'Malaria', status: 'confirmed', date: '2024-01-25' },
    { id: '2', patientName: 'Jane Smith', disease: 'Typhoid', status: 'suspected', date: '2024-01-24' },
    { id: '3', patientName: 'Bob Johnson', disease: 'Cholera', status: 'resolved', date: '2024-01-23' },
    { id: '4', patientName: 'Alice Williams', disease: 'Measles', status: 'confirmed', date: '2024-01-22' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BuildingOfficeIcon className="h-6 w-6 text-blue-700" />
            <h1 className="text-2xl font-bold text-gray-900">
              Facility Dashboard: {facility?.name || 'Loading...'}
            </h1>
          </div>
          <p className="text-gray-600">
            Overview of cases and activities at your facility
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <DocumentTextIcon className="h-6 w-6 text-blue-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Cases</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCases}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingCases}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Confirmed</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.confirmedCases}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <UserGroupIcon className="h-6 w-6 text-green-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Resolved</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.resolvedCases}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Cases Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Cases</h3>
            <div className="space-y-4">
              {cases.map((caseItem) => (
                <div key={caseItem.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{caseItem.patientName}</h4>
                      <p className="text-sm text-gray-600">{caseItem.disease}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      caseItem.status === 'suspected' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : caseItem.status === 'confirmed' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Reported on {caseItem.date}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Facility Staff</h3>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                  <div>
                    <h4 className="font-medium text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.role.replace('_', ' ')}</p>
                  </div>
                  <span className="text-sm text-gray-500">{user.email}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-700 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Report Case</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <UserGroupIcon className="h-8 w-8 text-green-700 mx-auto mb-2" />
              <p className="font-medium text-gray-900">View Team</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <MapPinIcon className="h-8 w-8 text-purple-700 mx-auto mb-2" />
              <p className="font-medium text-gray-900">View Location</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FacilityDashboard;