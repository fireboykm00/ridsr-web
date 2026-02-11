// src/app/(main)/dashboard/national/layout.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { USER_ROLES } from '@/types';

export default async function NationalDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  // Only admins and national officers can access the national dashboard
  if (session.user.role !== USER_ROLES.ADMIN &&
    session.user.role !== USER_ROLES.NATIONAL_OFFICER) {
    redirect('/dashboard'); // Redirect to their default dashboard
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">National Dashboard</h1>
          <p className="text-gray-600 mt-2">National-level surveillance data and reports</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          {children}
        </div>
      </div>
    </div>
  );
}