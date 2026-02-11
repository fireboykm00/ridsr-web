// src/app/(main)/dashboard/statistics/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { BarChart } from '@/components/ui/BarChart';
import { PieChart } from '@/components/ui/PieChart';
import { LineChart } from '@/components/ui/LineChart';
import { MapVisualization } from '@/components/ui/MapVisualization';

const StatisticsPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You must be signed in to view this page
          </p>
          <a
            href="/login"
            className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors inline-block"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  // Sample data for charts
  const diseaseData = [
    { name: 'Cholera', value: 120, color: '#EF4444' },
    { name: 'Malaria', value: 85, color: '#F59E0B' },
    { name: 'Typhoid', value: 65, color: '#10B981' },
    { name: 'Measles', value: 45, color: '#3B82F6' },
    { name: 'Plague', value: 25, color: '#8B5CF6' },
  ];

  const weeklyData = [
    { name: 'Mon', value: 45 },
    { name: 'Tue', value: 52 },
    { name: 'Wed', value: 48 },
    { name: 'Thu', value: 78 },
    { name: 'Fri', value: 65 },
    { name: 'Sat', value: 32 },
    { name: 'Sun', value: 28 },
  ];

  const provinceData = [
    { name: 'Kigali City', value: 45, colorIntensity: 0.3 },
    { name: 'Northern Province', value: 78, colorIntensity: 0.7 },
    { name: 'Southern Province', value: 65, colorIntensity: 0.6 },
    { name: 'Eastern Province', value: 32, colorIntensity: 0.2 },
    { name: 'Western Province', value: 89, colorIntensity: 0.8 },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Epidemiological Statistics</h1>
        <p className="text-gray-600">Detailed statistics and analytics for disease surveillance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Cases</h3>
          <p className="text-3xl font-bold text-gray-900">1,234</p>
          <p className="text-sm text-green-600 mt-1">+12% from last week</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Outbreaks</h3>
          <p className="text-3xl font-bold text-gray-900">12</p>
          <p className="text-sm text-red-600 mt-1">3 critical</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports This Week</h3>
          <p className="text-3xl font-bold text-gray-900">89</p>
          <p className="text-sm text-green-600 mt-1">On track</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Facilities Online</h3>
          <p className="text-3xl font-bold text-gray-900">456</p>
          <p className="text-sm text-green-600 mt-1">98% coverage</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Disease Distribution</h3>
          <PieChart
            data={diseaseData}
            size="md"
          />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Trends</h3>
          <LineChart
            data={weeklyData}
            color="blue"
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cases by Region</h3>
          <BarChart
            data={[
              { name: 'Kigali', value: 120 },
              { name: 'North', value: 95 },
              { name: 'South', value: 110 },
              { name: 'East', value: 85 },
              { name: 'West', value: 130 },
            ]}
          />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Spread</h3>
          <MapVisualization
            regions={provinceData}
            onRegionClick={(region) => console.log(region)}
          />
        </Card>
      </div>
    </div>
  );
};

export default StatisticsPage;