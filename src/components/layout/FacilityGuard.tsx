'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';
import { RwandaDistrictType } from '@/types';

interface FacilityGuardProps {
  children: ReactNode;
  allowedFacilityIds?: string[];
  allowedDistrictIds?: RwandaDistrictType[];
  fallback?: ReactNode;
}

const FacilityGuard = ({ children, allowedFacilityIds, allowedDistrictIds, fallback }: FacilityGuardProps) => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session?.user) {
    return fallback || <div className="text-sm text-muted-foreground">You must be logged in to view this content.</div>;
  }

  if (allowedFacilityIds && allowedFacilityIds.length > 0) {
    if (!session.user.facilityId || !allowedFacilityIds.includes(session.user.facilityId)) {
      return fallback || <div className="text-sm text-muted-foreground">You don&apos;t have permission to access this facility.</div>;
    }
  }

  if (allowedDistrictIds && allowedDistrictIds.length > 0) {
    if (!session.user.district || !allowedDistrictIds.includes(session.user.district)) {
      return fallback || <div className="text-sm text-muted-foreground">You don&apos;t have permission to access this district.</div>;
    }
  }

  if (!allowedFacilityIds && !allowedDistrictIds) {
    if (!session.user.facilityId && !session.user.district) {
      return fallback || <div className="text-sm text-muted-foreground">You don&apos;t have permission to view this content.</div>;
    }
  }

  return <>{children}</>;
};

export default FacilityGuard;
