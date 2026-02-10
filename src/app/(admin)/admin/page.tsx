// src/app/(admin)/admin/page.tsx
import { auth } from '@/lib/auth';
import { ROLES } from '@/lib/utils/auth';
import { redirect } from 'next/navigation';
import Card from '@/components/ui/Card';
import { ArrowTrendingUpIcon, UserGroupIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

const AdminDashboard = async () => {

  const stats = [
    {
      title: "Total Reports",
      value: "1,234",
      change: "+12%",
      icon: <ArrowTrendingUpIcon className="w-6 h-6 text-blue-700" />,
      color: "bg-blue-100"
    },
    {
      title: "Active Users",
      value: "567",
      change: "+5%",
      icon: <UserGroupIcon className="w-6 h-6 text-green-700" />,
      color: "bg-green-100"
    },
    {
      title: "Geographic Coverage",
      value: "98%",
      change: "+2%",
      icon: <MapPinIcon className="w-6 h-6 text-yellow-700" />,
      color: "bg-yellow-100"
    },
    {
      title: "Response Time",
      value: "24m",
      change: "-3m",
      icon: <ClockIcon className="w-6 h-6 text-purple-700" />,
      color: "bg-purple-100"
    }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of the RIDSR platform performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-start">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">New case reported</h3>
                  <p className="text-sm text-gray-600">From Kigali district</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Database</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">API Services</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Reporting System</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Maintenance</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Notification Service</span>
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Issue</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;