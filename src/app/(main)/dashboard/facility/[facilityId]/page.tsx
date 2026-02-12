'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToastHelpers } from '@/components/ui/Toast';
import { 
  ArrowLeftIcon,
  BuildingOfficeIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  ExclamationTriangleIcon,
  MapPinIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Facility, User, Case, USER_ROLES } from '@/types';
import { facilityService, canAccessFacility } from '@/lib/services/facilityService';
import { userService } from '@/lib/services/userService';

interface FacilityStats {
  totalCases: number;
  pendingCases: number;
  validatedCases: number;
  totalStaff: number;
  recentCases: Case[];
}

export default function FacilityDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const { error: showError } = useToastHelpers();
  const facilityId = params.facilityId as string;

  const [facility, setFacility] = useState<Facility | null>(null);
  const [staff, setStaff] = useState<User[]>([]);
  const [stats, setStats] = useState<FacilityStats>({
    totalCases: 0,
    pendingCases: 0,
    validatedCases: 0,
    totalStaff: 0,
    recentCases: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFacilityData = async () => {
      if (status === 'authenticated' && session?.user) {
        try {
          // Check access permissions
          const hasAccess = await canAccessFacility(facilityId);
          if (!hasAccess) {
            showError('Access denied to this facility');
            router.push('/dashboard/facility');
            return;
          }

          // Load facility details
          const facilityData = await facilityService.getFacilityById(facilityId);
          if (!facilityData) {
            showError('Facility not found');
            router.push('/dashboard/facility');
            return;
          }
          setFacility(facilityData);

          // Load facility staff
          let staffData = [];
          try {
            staffData = await userService.getUsersByFacility(facilityId);
            setStaff(staffData);
          } catch (error) {
            console.error('Error loading staff:', error);
          }

          // Load facility cases
          let facilityCases = [];
          try {
            const casesResponse = await fetch(`/api/cases?facilityId=${facilityId}`);
            if (casesResponse.ok) {
              const casesData = await casesResponse.json();
              facilityCases = casesData.data?.data || casesData.data || [];
            }
          } catch (error) {
            console.error('Error loading cases:', error);
          }

          // Calculate real statistics
          const stats: FacilityStats = {
            totalCases: facilityCases.length,
            pendingCases: facilityCases.filter((c: any) => c.validationStatus === 'pending').length,
            validatedCases: facilityCases.filter((c: any) => c.validationStatus === 'validated').length,
            totalStaff: staffData?.length || 0,
            recentCases: facilityCases.slice(0, 5)
          };
          setStats(stats);

        } catch (error) {
          console.error('Error loading facility data:', error);
          showError('Failed to load facility details');
        } finally {
          setLoading(false);
        }
      }
    };

    loadFacilityData();
  }, [status, session, facilityId, showError, router]);

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
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please sign in to view facility details</p>
        </Card>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Facility not found</h2>
          <Link href="/dashboard/facility">
            <Button variant="secondary">Back to Facilities</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/facility">
            <Button variant="secondary" size="sm" className="flex items-center gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Facilities
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{facility.name}</h1>
              <p className="text-gray-600">{facility.code} • {facility.type.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
        <Badge variant={facility.isActive ? 'success' : 'error'}>
          {facility.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <DocumentTextIcon className="h-6 w-6 text-blue-700" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Total Cases</h3>
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
              <h3 className="text-sm font-medium text-gray-600">Pending Cases</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingCases}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <ChartBarIcon className="h-6 w-6 text-green-700" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Validated Cases</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.validatedCases}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <UserGroupIcon className="h-6 w-6 text-purple-700" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Staff Members</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Facility Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Facility Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Facility Code</p>
                <p className="text-gray-900 font-medium">{facility.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="text-gray-900 font-medium capitalize">
                  {facility.type.replace('_', ' ')}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">District</p>
                <p className="text-gray-900 font-medium capitalize">
                  {facility.district.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Province</p>
                <p className="text-gray-900 font-medium capitalize">
                  {facility.province.replace('_', ' ')}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge variant={facility.isActive ? 'success' : 'error'}>
                {facility.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="text-gray-900 font-medium">
                {new Date(facility.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Staff Members */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Staff Members</h2>
            <Badge variant="info">{staff.length} members</Badge>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {staff.length > 0 ? (
              staff.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                  <Badge variant="info">
                    {member.role.replace('_', ' ')}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No staff members found</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href={`/dashboard/cases?facility=${facilityId}`}>
            <Button variant="secondary" fullWidth className="flex items-center justify-center gap-2 h-16">
              <DocumentTextIcon className="h-6 w-6" />
              <span>View Cases</span>
            </Button>
          </Link>
          {session.user.role === USER_ROLES.ADMIN && (
            <Link href={`/dashboard/admin?tab=facilities&facility=${facilityId}`}>
              <Button variant="secondary" fullWidth className="flex items-center justify-center gap-2 h-16">
                <UserGroupIcon className="h-6 w-6" />
                <span>Manage Staff</span>
              </Button>
            </Link>
          )}
          <Button variant="secondary" fullWidth className="flex items-center justify-center gap-2 h-16">
            <ChartBarIcon className="h-6 w-6" />
            <span>View Reports</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}