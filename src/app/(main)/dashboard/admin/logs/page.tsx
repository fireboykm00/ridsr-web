'use client';

import { useSession } from 'next-auth/react';
import { USER_ROLES } from '@/types';
import { Card } from '@/components/ui/Card';

export default function AuditLogsPage() {
  const { data: session } = useSession();

  if (session?.user?.role !== USER_ROLES.ADMIN) {
    return <div className="p-6">Access Denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-left">Audit Logs</h1>

        <Card className="p-6">
          <div className="mb-6 flex gap-4">
            <input type="text" placeholder="Search logs..." className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
            <select className="px-3 py-2 border border-gray-300 rounded-lg">
              <option>All Actions</option>
              <option>User Created</option>
              <option>User Updated</option>
              <option>Case Reported</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">Timestamp</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">Action</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">Details</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td colSpan={4} className="py-8 px-4 text-center text-gray-500">No logs available</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
