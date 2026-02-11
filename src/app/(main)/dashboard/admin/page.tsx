'use client';

import { useSession } from 'next-auth/react';
import { USER_ROLES } from '@/types';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function AdminPage() {
  const { data: session } = useSession();

  if (session?.user?.role !== USER_ROLES.ADMIN) {
    return <div className="p-6">Access Denied</div>;
  }

  const adminTools = [
    { title: 'User Management', href: '/dashboard/users', description: 'Manage system users and roles' },
    { title: 'Facility Management', href: '/dashboard/facilities', description: 'Configure health facilities' },
    { title: 'System Configuration', href: '/dashboard/admin/config', description: 'System settings and configuration' },
    { title: 'Audit Logs', href: '/dashboard/admin/logs', description: 'View system activity logs' },
    { title: 'Monitoring', href: '/dashboard/admin/monitoring', description: 'System health and performance' },
    { title: 'Reports', href: '/dashboard/reports', description: 'Generate system reports' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-left">Administration</h1>
        <p className="text-gray-600 mb-8 text-left">Manage system configuration and users</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminTools.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.title}</h3>
                <p className="text-gray-600 text-sm">{tool.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
