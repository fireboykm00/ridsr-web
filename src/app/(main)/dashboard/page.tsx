'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { BarChart } from '@/components/ui/BarChart';
import { PieChart } from '@/components/ui/PieChart';
import { LineChart } from '@/components/ui/LineChart';
import { MapVisualization } from '@/components/ui/MapVisualization';
import { BellAlertIcon } from '@heroicons/react/24/outline';
import { DashboardMetrics, DashboardChartData } from '@/types';
import { getDashboardMetrics, getDashboardCharts } from '@/lib/services/dashboard.service';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [charts, setCharts] = useState<Record<string, DashboardChartData[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session?.user) {
          const [metricsData, chartsData] = await Promise.all([
            getDashboardMetrics(),
            getDashboardCharts(),
          ]);
          setMetrics(metricsData);
          setCharts(chartsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchData();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [session?.user, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You must be signed in to view this page</p>
          <button
            onClick={() => signIn()}
            className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-left">Surveillance Dashboard</h1>
          <p className="text-gray-600 text-left">Welcome back, {session.user?.name}</p>
        </div>

        {/* Role-specific content */}
        {session.user?.role === 'admin' ? (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <BellAlertIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
              <div>
                <h3 className="font-medium text-blue-800">Administrative Dashboard</h3>
                <p className="text-sm text-blue-700 mt-1">
                  You have administrative privileges. Manage users, configure system settings, and monitor platform activity.
                </p>
              </div>
            </div>
          </div>
        ) : session.user?.role === 'district_officer' ? (
          <div className="mb-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start">
              <BellAlertIcon className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
              <div>
                <h3 className="font-medium text-yellow-800">District Officer Dashboard</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Monitor disease trends in your district, review reports from health facilities, and coordinate response activities.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start">
              <BellAlertIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
              <div>
                <h3 className="font-medium text-green-800">Health Worker Dashboard</h3>
                <p className="text-sm text-green-700 mt-1">
                  Report cases, monitor local disease trends, and access reference materials.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Cases</h3>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalCases}</p>
              <p className="text-sm text-green-600 mt-1">+12% from last week</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Outbreaks</h3>
              <p className="text-3xl font-bold text-gray-900">{metrics.activeOutbreaks}</p>
              <p className="text-sm text-red-600 mt-1">3 critical</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports This Week</h3>
              <p className="text-3xl font-bold text-gray-900">{metrics.reportsThisWeek}</p>
              <p className="text-sm text-green-600 mt-1">On track</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Facilities Online</h3>
              <p className="text-3xl font-bold text-gray-900">{metrics.facilitiesOnline}</p>
              <p className="text-sm text-green-600 mt-1">98% coverage</p>
            </Card>
          </div>
        )}

        {/* Charts Grid */}
        {charts && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {charts.diseaseDistribution && charts.diseaseDistribution.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Disease Distribution</h3>
                  <PieChart data={charts.diseaseDistribution} size="md" />
                </Card>
              )}
              {charts.weeklyTrends && charts.weeklyTrends.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Trends</h3>
                  <LineChart data={charts.weeklyTrends} color="blue" />
                </Card>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {charts.regionCases && charts.regionCases.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Cases by Region</h3>
                  <BarChart data={charts.regionCases} />
                </Card>
              )}
              {charts.geographicSpread && charts.geographicSpread.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Spread</h3>
                  <MapVisualization
                    regions={charts.geographicSpread.map(d => ({
                      name: d.name,
                      value: d.value,
                      colorIntensity: d.colorIntensity || 0.5,
                    }))}
                    onRegionClick={(region) => console.log(`Clicked on ${region.name}`)}
                  />
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
