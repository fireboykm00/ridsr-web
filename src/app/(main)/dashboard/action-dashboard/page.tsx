// src/app/(main)/dashboard/action-dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { LineChart } from '@/components/ui/LineChart';
import { BarChart } from '@/components/ui/BarChart';
import { Badge } from '@/components/ui/Badge';
import { USER_ROLES } from '@/types';
import { facilityService } from '@/lib/services/facility-service';

interface DiseaseTrend {
  date: string;
  count: number;
}

interface OutbreakAlert {
  id: string;
  disease: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  cases: number;
}

interface EpiCurveData {
  disease: string;
  data: DiseaseTrend[];
}

const ActionDashboard = () => {
  const { data: session, status } = useSession();
  const [epiCurves, setEpiCurves] = useState<EpiCurveData[]>([]);
  const [outbreakAlerts, setOutbreakAlerts] = useState<OutbreakAlert[]>([]);
  const [topDiseases, setTopDiseases] = useState<{ name: string, count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (status === 'authenticated' && session) {
        try {
          // Generate mock data based on user's role and location
          let mockEpiCurves: EpiCurveData[] = [];
          let mockOutbreakAlerts: OutbreakAlert[] = [];
          let mockTopDiseases: { name: string, count: number }[] = [];

          if (session.user?.role === USER_ROLES.ADMIN) {
            // Admins see all data
            mockEpiCurves = [
              {
                disease: 'Malaria',
                data: [
                  { date: 'Jan 1', count: 45 },
                  { date: 'Jan 8', count: 52 },
                  { date: 'Jan 15', count: 48 },
                  { date: 'Jan 22', count: 78 },
                  { date: 'Jan 29', count: 65 },
                  { date: 'Feb 5', count: 89 },
                  { date: 'Feb 12', count: 95 },
                ]
              },
              {
                disease: 'Cholera',
                data: [
                  { date: 'Jan 1', count: 12 },
                  { date: 'Jan 8', count: 15 },
                  { date: 'Jan 15', count: 18 },
                  { date: 'Jan 22', count: 25 },
                  { date: 'Jan 29', count: 32 },
                  { date: 'Feb 5', count: 41 },
                  { date: 'Feb 12', count: 48 },
                ]
              }
            ];

            mockOutbreakAlerts = [
              {
                id: 'alert-1',
                disease: 'Cholera',
                location: 'Rusizi District',
                severity: 'critical',
                date: '2024-02-12',
                cases: 48
              },
              {
                id: 'alert-2',
                disease: 'Malaria',
                location: 'Bugesera District',
                severity: 'high',
                date: '2024-02-11',
                cases: 89
              },
              {
                id: 'alert-3',
                disease: 'Typhoid',
                location: 'Ngororero District',
                severity: 'medium',
                date: '2024-02-10',
                cases: 23
              }
            ];

            mockTopDiseases = [
              { name: 'Malaria', count: 1245 },
              { name: 'Cholera', count: 324 },
              { name: 'Typhoid', count: 187 },
              { name: 'Measles', count: 98 },
              { name: 'Plague', count: 45 }
            ];
          } else if (session.user?.role === USER_ROLES.NATIONAL_OFFICER) {
            // National officers see national data
            mockEpiCurves = [
              {
                disease: 'Malaria',
                data: [
                  { date: 'Jan 1', count: 32 },
                  { date: 'Jan 8', count: 38 },
                  { date: 'Jan 15', count: 35 },
                  { date: 'Jan 22', count: 56 },
                  { date: 'Jan 29', count: 47 },
                  { date: 'Feb 5', count: 64 },
                  { date: 'Feb 12', count: 68 },
                ]
              },
              {
                disease: 'Cholera',
                data: [
                  { date: 'Jan 1', count: 8 },
                  { date: 'Jan 8', count: 11 },
                  { date: 'Jan 15', count: 13 },
                  { date: 'Jan 22', count: 18 },
                  { date: 'Jan 29', count: 22 },
                  { date: 'Feb 5', count: 29 },
                  { date: 'Feb 12', count: 34 },
                ]
              }
            ];

            mockOutbreakAlerts = [
              {
                id: 'alert-1',
                disease: 'Cholera',
                location: 'Rusizi District',
                severity: 'high',
                date: '2024-02-12',
                cases: 34
              },
              {
                id: 'alert-2',
                disease: 'Malaria',
                location: 'Bugesera District',
                severity: 'medium',
                date: '2024-02-11',
                cases: 64
              }
            ];

            mockTopDiseases = [
              { name: 'Malaria', count: 890 },
              { name: 'Cholera', count: 234 },
              { name: 'Typhoid', count: 134 },
              { name: 'Measles', count: 72 },
              { name: 'Plague', count: 32 }
            ];
          } else if (session.user?.role === USER_ROLES.DISTRICT_OFFICER && session.user.district) {
            // District officers see data for their district
            mockEpiCurves = [
              {
                disease: 'Malaria',
                data: [
                  { date: 'Jan 1', count: 8 },
                  { date: 'Jan 8', count: 12 },
                  { date: 'Jan 15', count: 10 },
                  { date: 'Jan 22', count: 18 },
                  { date: 'Jan 29', count: 15 },
                  { date: 'Feb 5', count: 21 },
                  { date: 'Feb 12', count: 23 },
                ]
              },
              {
                disease: 'Cholera',
                data: [
                  { date: 'Jan 1', count: 2 },
                  { date: 'Jan 8', count: 3 },
                  { date: 'Jan 15', count: 4 },
                  { date: 'Jan 22', count: 6 },
                  { date: 'Jan 29', count: 8 },
                  { date: 'Feb 5', count: 11 },
                  { date: 'Feb 12', count: 14 },
                ]
              }
            ];

            mockOutbreakAlerts = [
              {
                id: 'alert-1',
                disease: 'Cholera',
                location: session.user.district,
                severity: 'medium',
                date: '2024-02-12',
                cases: 14
              }
            ];

            mockTopDiseases = [
              { name: 'Malaria', count: 234 },
              { name: 'Cholera', count: 67 },
              { name: 'Typhoid', count: 34 },
              { name: 'Measles', count: 12 },
              { name: 'Plague', count: 5 }
            ];
          } else if (session.user?.role &&
            (session.user.role === USER_ROLES.HEALTH_WORKER || session.user.role === USER_ROLES.LAB_TECHNICIAN) &&
            session.user.facilityId) {
            // Health workers and lab technicians see data for their facility
            // The facility data is retrieved but not used in this mock implementation
            await facilityService.getFacilityById(session.user.facilityId);

            mockEpiCurves = [
              {
                disease: 'Malaria',
                data: [
                  { date: 'Jan 1', count: 2 },
                  { date: 'Jan 8', count: 3 },
                  { date: 'Jan 15', count: 2 },
                  { date: 'Jan 22', count: 5 },
                  { date: 'Jan 29', count: 4 },
                  { date: 'Feb 5', count: 6 },
                  { date: 'Feb 12', count: 7 },
                ]
              }
            ];

            mockOutbreakAlerts = []; // No alerts at facility level

            mockTopDiseases = [
              { name: 'Malaria', count: 56 },
              { name: 'Cholera', count: 12 },
              { name: 'Typhoid', count: 8 },
              { name: 'Measles', count: 3 },
              { name: 'Plague', count: 1 }
            ];
          }

          setEpiCurves(mockEpiCurves);
          setOutbreakAlerts(mockOutbreakAlerts);
          setTopDiseases(mockTopDiseases);
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [status, session]);

  if (status === "loading" || isLoading) {
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Action Dashboard</h1>
        <p className="text-gray-600">
          {session.user?.role === USER_ROLES.DISTRICT_OFFICER
            ? `Epidemiological trends in ${session.user?.district} district`
            : session.user?.role === USER_ROLES.HEALTH_WORKER || session.user?.role === USER_ROLES.LAB_TECHNICIAN
              ? `Trends at your facility`
              : 'National epidemiological trends and alerts'
          }
        </p>
      </div>

      {/* Outbreak Alerts */}
      {outbreakAlerts.length > 0 && (
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Outbreak Alerts</h2>
          <div className="space-y-4">
            {outbreakAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                  alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                    alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{alert.disease} Outbreak</h3>
                    <p className="text-gray-600">{alert.location} • {alert.date}</p>
                  </div>
                  <Badge variant={getSeverityColor(alert.severity)}>
                    {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                  </Badge>
                </div>
                <div className="mt-2">
                  <p className="text-gray-700">{alert.cases} cases reported</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Epidemiological Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {epiCurves.map((curve, index) => (
          <Card key={index} className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{curve.disease} Trend</h3>
            <LineChart
              data={curve.data.map(item => ({ name: item.date, value: item.count }))}
              color={index === 0 ? 'blue' : 'red'}
            />
          </Card>
        ))}
      </div>

      {/* Top Diseases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Disease Incidence</h3>
          <BarChart
            data={topDiseases.map(disease => ({ name: disease.name, value: disease.count }))}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Diseases</h3>
          <div className="space-y-4">
            {topDiseases.slice(0, 5).map((disease, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-lg font-medium mr-2">{index + 1}.</span>
                  <span className="font-medium">{disease.name}</span>
                </div>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {disease.count}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <div className="text-blue-700 font-medium mb-1">Generate Report</div>
            <p className="text-sm text-gray-600">Create outbreak report</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <div className="text-green-700 font-medium mb-1">View Map</div>
            <p className="text-sm text-gray-600">Geographic distribution</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <div className="text-purple-700 font-medium mb-1">Alert System</div>
            <p className="text-sm text-gray-600">Configure thresholds</p>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default ActionDashboard;