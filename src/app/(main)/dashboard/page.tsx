'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { USER_ROLES } from '@/types';
import {
  DocumentTextIcon,
  UserGroupIcon,
  BellIcon,
  CheckCircleIcon,
  BeakerIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn();
    } else if (status === 'authenticated') {
      setIsLoading(false);
    }
  }, [status]);

  if (isLoading || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  const role = session.user.role;

  // Admin Dashboard
  if (role === USER_ROLES.ADMIN) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/user')}>
              <UserGroupIcon className="w-8 h-8 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">User Management</h2>
              <p className="text-gray-600">Manage system users and roles</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/facility')}>
              <BeakerIcon className="w-8 h-8 text-green-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Facility Management</h2>
              <p className="text-gray-600">Manage health facilities</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/cases')}>
              <DocumentTextIcon className="w-8 h-8 text-purple-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Cases</h2>
              <p className="text-gray-600">View all reported cases</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/alert')}>
              <BellIcon className="w-8 h-8 text-red-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Alerts</h2>
              <p className="text-gray-600">Manage system alerts</p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // National Officer Dashboard
  if (role === USER_ROLES.NATIONAL_OFFICER) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">National Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/cases')}>
              <DocumentTextIcon className="w-8 h-8 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Cases</h2>
              <p className="text-gray-600">View national case statistics</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/alert')}>
              <BellIcon className="w-8 h-8 text-red-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Alerts</h2>
              <p className="text-gray-600">Monitor active alerts</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/report')}>
              <ChartBarIcon className="w-8 h-8 text-green-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Reports</h2>
              <p className="text-gray-600">View epidemiological reports</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/validation')}>
              <CheckCircleIcon className="w-8 h-8 text-purple-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Validation</h2>
              <p className="text-gray-600">Review case validations</p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // District Officer Dashboard
  if (role === USER_ROLES.DISTRICT_OFFICER) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">District Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/dashboard/district/${session?.user?.district || 'default'}`)}>
              <DocumentTextIcon className="w-8 h-8 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">District Cases</h2>
              <p className="text-gray-600">View cases in your district</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/validation')}>
              <CheckCircleIcon className="w-8 h-8 text-green-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Verify Cases</h2>
              <p className="text-gray-600">Verify suspected cases</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/alert')}>
              <BellIcon className="w-8 h-8 text-red-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Alerts</h2>
              <p className="text-gray-600">Monitor district alerts</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/report')}>
              <ChartBarIcon className="w-8 h-8 text-purple-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Reports</h2>
              <p className="text-gray-600">View district reports</p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Lab Technician Dashboard
  if (role === USER_ROLES.LAB_TECHNICIAN) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Lab Portal</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/validation-hub')}>
              <BeakerIcon className="w-8 h-8 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Specimen Tracking</h2>
              <p className="text-gray-600">Enter lab results and track specimens</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/cases')}>
              <DocumentTextIcon className="w-8 h-8 text-green-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Cases</h2>
              <p className="text-gray-600">View pending cases</p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Health Worker Dashboard
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Health Worker Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/report-case')}>
            <DocumentTextIcon className="w-8 h-8 text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Report Case</h2>
            <p className="text-gray-600">Submit a new case report</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/cases')}>
            <DocumentTextIcon className="w-8 h-8 text-green-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">My Cases</h2>
            <p className="text-gray-600">View your submitted cases</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/patient')}>
            <UserGroupIcon className="w-8 h-8 text-purple-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Patients</h2>
            <p className="text-gray-600">Search and manage patients</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/alert')}>
            <BellIcon className="w-8 h-8 text-red-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Alerts</h2>
            <p className="text-gray-600">View system alerts</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
