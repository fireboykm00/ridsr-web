'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';
import { UserRole } from '@/types';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

const RoleGuard = ({ children, allowedRoles, fallback }: RoleGuardProps) => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
    return fallback || <div className="text-sm text-muted-foreground">You don&apos;t have permission to view this content.</div>;
  }

  return <>{children}</>;
};

export default RoleGuard;
