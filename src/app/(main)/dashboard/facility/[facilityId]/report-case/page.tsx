'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import CaseReportForm from '@/components/forms/CaseReportForm';
import { USER_ROLES } from '@/types';
import { facilityService } from '@/lib/services/facilityService';

export default function FacilityCaseReportForm() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const facilityId = params.facilityId as string;
  const [facilityInfo, setFacilityInfo] = useState<{ name: string, district: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load facility information
  useEffect(() => {
    const loadFacility = async () => {
      if (status === 'authenticated' && session && facilityId) {
        try {
          const facility = await facilityService.getFacilityById(facilityId);
          if (facility) {
            setFacilityInfo({ name: facility.name, district: facility.district });
          }
        } catch (err) {
          console.error('Error loading facility:', err);
        } finally {
          setIsLoading(false);
        }
      } else if (status !== 'loading') {
        setIsLoading(false);
      }
    };

    loadFacility();
  }, [status, session, facilityId]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You must be signed in to view this page
          </p>
          <a
            href="/login"
            className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors inline-block"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  // Check if user has permission to report cases for this facility
  const canReportForFacility = () => {
    const userRole = session.user?.role;
    const userFacilityId = session.user?.facilityId;
    const userDistrict = session.user?.district;

    // Admins can report for any facility
    if (userRole === USER_ROLES.ADMIN) return true;

    // Health workers and lab technicians can only report for their own facility
    if ([USER_ROLES.HEALTH_WORKER, USER_ROLES.LAB_TECHNICIAN].includes(userRole as any)) {
      return userFacilityId === facilityId;
    }

    // District officers can report for facilities in their district
    if (userRole === USER_ROLES.DISTRICT_OFFICER) {
      return facilityInfo?.district === userDistrict;
    }

    // National officers can report for any facility
    if (userRole === USER_ROLES.NATIONAL_OFFICER) return true;

    return false;
  };

  if (!canReportForFacility()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don&apos;t have permission to report cases for this facility.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleCancel = () => {
    router.push(`/dashboard/facility/${facilityId}`);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-foreground/80"
            >
              Dashboard
            </button>
            <span>/</span>
            <button
              onClick={() => router.push(`/dashboard/facility/${facilityId}`)}
              className="hover:text-foreground/80"
            >
              {facilityInfo?.name || 'Facility'}
            </button>
            <span>/</span>
            <span className="text-foreground">Report Case</span>
          </nav>

          <h1 className="text-3xl font-bold text-foreground mb-2">Case Reporting Form</h1>
          <p className="text-muted-foreground">
            Report suspected or confirmed cases of epidemic-prone diseases from{' '}
            <span className="font-medium">{facilityInfo?.name || 'this facility'}</span>
            {facilityInfo?.district && (
              <span className="text-muted-foreground"> ({facilityInfo.district})</span>
            )}
          </p>
        </div>

        <CaseReportForm
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
