'use client';

import { ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Breadcrumb from './Breadcrumb';

interface DashboardClientProps {
  children: ReactNode;
}

export default function DashboardClient({ children }: DashboardClientProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className='max-w-64 w-full'>
        <Sidebar />
      </div>
      <div className="flex-1">
        <div className="flex items-center border-b border-gray-200 bg-white p-4 sticky top-0 z-10">
          <Breadcrumb />
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div >
  );
}
