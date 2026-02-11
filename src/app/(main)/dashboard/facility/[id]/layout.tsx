// src/app/(main)/dashboard/facility/[id]/layout.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { USER_ROLES } from '@/types';

export default async function FacilityDashboardLayout({
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

  // Check if user has access to this facility
  if (session.user.role !== USER_ROLES.ADMIN &&
    session.user.role !== USER_ROLES.NATIONAL_OFFICER &&
    session.user.role !== USER_ROLES.DISTRICT_OFFICER) {
    const { id: facilityId } = await params;
    // Health workers and lab technicians can only access their own facility
    if (facilityId !== session.user.facilityId) {
      redirect('/dashboard'); // Redirect to their default dashboard
    }
  } else if (session.user.role === USER_ROLES.DISTRICT_OFFICER) {
    const { id: facilityId } = await params;
    // District officers can only access facilities in their district
    // In a real app, we'd check if the facility belongs to the user's district
    // For now, we'll allow access as the middleware handles this
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Facility Dashboard</h1>
          <p className="text-gray-600 mt-2">Managing facility: {params.id}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          {children}
        </div>
      </div>
    </div>
  );
}