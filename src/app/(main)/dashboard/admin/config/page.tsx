'use client';

import { useSession } from 'next-auth/react';
import { USER_ROLES } from '@/types';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';

export default function ConfigPage() {
  const { data: session } = useSession();

  if (session?.user?.role !== USER_ROLES.ADMIN) {
    return <div className="p-6">Access Denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-left">System Configuration</h1>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">System Name</label>
              <input type="text" defaultValue="RIDSR Platform" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Mode</label>
              <Checkbox />
            </div>
            <Button className="w-full">Save Settings</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Threshold Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alert Threshold</label>
              <input type="number" defaultValue="5" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <Button className="w-full">Update Thresholds</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
