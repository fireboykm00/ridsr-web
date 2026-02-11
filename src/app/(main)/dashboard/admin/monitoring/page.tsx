'use client';

import { useSession } from 'next-auth/react';
import { USER_ROLES } from '@/types';
import { Card } from '@/components/ui/Card';

export default function MonitoringPage() {
  const { data: session } = useSession();

  if (session?.user?.role !== USER_ROLES.ADMIN) {
    return <div className="p-6">Access Denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-left">System Monitoring</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">System Status</h3>
            <p className="text-2xl font-bold text-green-600">Operational</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Active Users</h3>
            <p className="text-2xl font-bold text-blue-600">0</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">API Response Time</h3>
            <p className="text-2xl font-bold text-blue-600">0ms</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Database Status</h3>
            <p className="text-2xl font-bold text-green-600">Connected</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="text-gray-600 text-center py-8">No recent activity</div>
        </Card>
      </div>
    </div>
  );
}
