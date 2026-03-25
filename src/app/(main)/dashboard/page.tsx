'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { USER_ROLES } from '@/types';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      const role = session.user.role;
      
      // Auto-redirect based on role
      if (role === USER_ROLES.ADMIN || role === USER_ROLES.NATIONAL_OFFICER) {
        router.replace('/dashboard/national');
      } else if (role === USER_ROLES.DISTRICT_OFFICER && session.user.district) {
        router.replace(`/dashboard/district/${session.user.district}`);
      } else if (role === USER_ROLES.LAB_TECHNICIAN) {
        router.replace('/dashboard/validation-hub');
      } else {
        router.replace('/dashboard/facility');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Please sign in to access the dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
