// src/components/layout/RoleGuard.tsx
'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

const RoleGuard = ({ children, allowedRoles, fallback }: RoleGuardProps) => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!session || !allowedRoles.includes(session.user?.role)) {
    return fallback || <div>You don't have permission to view this content.</div>;
  }

  return <>{children}</>;
};

export default RoleGuard;