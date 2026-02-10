// src/app/(admin)/layout.tsx
import { ReactNode } from 'react';
import { auth } from '@/lib/auth';
import { ROLES } from '@/lib/utils/auth';
import { redirect } from 'next/navigation';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();


  if (!session || session.user?.role !== ROLES.ADMIN) {
    redirect('/login');
  }

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="ml-2 text-lg font-bold text-gray-900">Admin Panel</span>
            </div>
            <nav className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
              <a href="#" className="text-gray-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium">Users</a>
              <a href="#" className="text-gray-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium">Settings</a>
            </nav>
          </div>
        </div>
      </header>
      <main>
        {children}
      </main>
    </>
  );
}