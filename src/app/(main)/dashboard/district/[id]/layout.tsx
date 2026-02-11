// src/app/(main)/dashboard/district/[id]/layout.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { USER_ROLES } from '@/types';

export default async function DistrictDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  // Check if user has access to this district
  if (session.user.role !== USER_ROLES.ADMIN &&
    session.user.role !== USER_ROLES.NATIONAL_OFFICER) {
    const { id: districtId } = await params;
    // District officers can only access their own district
    if (session.user.role === USER_ROLES.DISTRICT_OFFICER && districtId !== session.user.district) {
      redirect('/dashboard'); // Redirect to their default dashboard
    } else if (session.user.role !== USER_ROLES.DISTRICT_OFFICER) {
      // Health workers and lab technicians don't have direct district access
      redirect('/dashboard'); // Redirect to their default dashboard
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">District Dashboard</h1>
          <p className="text-gray-600 mt-2">Managing district: {params.id}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          {children}
        </div>
      </div>
    </div>
  );
}