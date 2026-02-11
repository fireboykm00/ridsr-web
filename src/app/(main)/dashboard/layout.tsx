// src/app/(main)/dashboard/layout.tsx
'use client';

import { ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import {
  HomeIcon,
  DocumentTextIcon,
  TableCellsIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!session) {
    // If not authenticated, redirect to login
    if (typeof window !== 'undefined') {
      redirect('/login');
    }
    return null;
  }

  // Define sidebar items based on user role
  const sidebarItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <HomeIcon className="h-5 w-5" />,
    },
    {
      name: 'Report Case',
      href: '/dashboard/report-case',
      icon: <DocumentTextIcon className="h-5 w-5" />,
    },
    {
      name: 'Cases',
      href: '/dashboard/cases',
      icon: <TableCellsIcon className="h-5 w-5" />,
    },
    {
      name: 'Statistics',
      href: '/dashboard/statistics',
      icon: <ChartBarIcon className="h-5 w-5" />,
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: <UserCircleIcon className="h-5 w-5" />,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: <Cog6ToothIcon className="h-5 w-5" />,
    },
    ...(session.user?.role === 'admin' 
      ? [{
          name: 'Admin Panel',
          href: '/admin',
          icon: <Cog6ToothIcon className="h-5 w-5" />,
        }] 
      : []
    ),
    {
      name: 'Logout',
      href: '#',
      icon: <ArrowRightOnRectangleIcon className="h-5 w-5" />,
      onClick: () => signOut({ callbackUrl: '/login' })
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        items={sidebarItems} 
      />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}