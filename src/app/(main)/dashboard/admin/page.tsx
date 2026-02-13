"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { USER_ROLES } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LineChart } from "@/components/ui/LineChart";
import { BarChart } from "@/components/ui/BarChart";
import { MapVisualization } from "@/components/ui/MapVisualization";
import Link from "next/link";
import {
  Users,
  Building2,
  FileText,
  AlertTriangle,
  Activity,
  TrendingUp,
  MapPin,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react";

interface SystemStats {
  totalUsers: number;
  totalFacilities: number;
  totalCases: number;
  totalAlerts: number;
  activeUsers: number;
  pendingValidations: number;
  systemHealth: "healthy" | "warning" | "critical";
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
}

interface ChartData {
  usersByRole: Array<{ role: string; count: number; color: string }>;
  facilitiesByDistrict: Array<{ district: string; count: number }>;
  caseTrends: Array<{ date: string; cases: number; alerts: number }>;
}

interface UserSummary {
  role?: string;
  status?: string;
}

interface FacilitySummary {
  district?: string;
}

interface CaseSummary {
  validationStatus?: string;
}

export default function AdminPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, facilitiesRes, casesRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/facilities"),
          fetch("/api/cases"),
        ]);

        const usersData = await usersRes.json();
        const facilitiesData = await facilitiesRes.json();
        const casesData = await casesRes.json();

        const users: UserSummary[] = usersData.data?.data || usersData.data || [];
        const facilities: FacilitySummary[] = facilitiesData.data?.data || facilitiesData.data || [];
        const cases: CaseSummary[] = casesData.data?.data || casesData.data || [];

        // Process system stats
        const systemStats: SystemStats = {
          totalUsers: users.length,
          totalFacilities: facilities.length,
          totalCases: cases.length,
          totalAlerts: 0,
          activeUsers: users.filter((u) => u.status === "active").length,
          pendingValidations: cases.filter(
            (c) => c.validationStatus === "pending",
          ).length,
          systemHealth: "healthy",
          recentActivity: [],
        };

        // Process chart data
        const roleDistribution = users.reduce<Record<string, number>>(
          (acc, user) => {
            const role = user.role || "unknown";
            acc[role] = (acc[role] || 0) + 1;
            return acc;
          },
          {},
        );

        const districtDistribution = facilities.reduce<Record<string, number>>(
          (acc, facility) => {
            const district = facility.district || "unknown";
            acc[district] = (acc[district] || 0) + 1;
            return acc;
          },
          {},
        );

        const chartData: ChartData = {
          usersByRole: Object.entries(roleDistribution).map(
            ([role, count], index) => ({
              role,
              count: count as number,
              color: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][
                index % 5
              ],
            }),
          ),
          facilitiesByDistrict: Object.entries(districtDistribution).map(
            ([district, count]) => ({
              district,
              count: count as number,
            }),
          ),
          caseTrends: [],
        };

        setStats(systemStats);
        setChartData(chartData);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === USER_ROLES.ADMIN) {
      fetchData();
    }
  }, [session]);

  if (session?.user?.role !== USER_ROLES.ADMIN) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You need administrator privileges to access this page.
          </p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getHealthBadge = (health: string) => {
    switch (health) {
      case "healthy":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Healthy
          </Badge>
        );
      case "warning":
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Warning
          </Badge>
        );
      case "critical":
        return (
          <Badge variant="danger" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Critical
          </Badge>
        );
      default:
        return <Badge variant="default">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            System Administration
          </h1>
          <p className="text-gray-600">
            Comprehensive system overview and management tools
          </p>
        </div>

        {/* System Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalUsers || 0}
                </p>
                <p className="text-sm text-green-600">
                  {stats?.activeUsers || 0} active
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Health Facilities
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalFacilities || 0}
                </p>
                <p className="text-sm text-blue-600">Across all districts</p>
              </div>
              <Building2 className="h-12 w-12 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cases</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalCases || 0}
                </p>
                <p className="text-sm text-orange-600">
                  {stats?.pendingValidations || 0} pending
                </p>
              </div>
              <FileText className="h-12 w-12 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Alerts
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalAlerts || 0}
                </p>
                <p className="text-sm text-red-600">Require attention</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
          </Card>
        </div>

        {/* System Health & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Status</span>
                {getHealthBadge(stats?.systemHealth || "healthy")}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <Badge variant="info">{stats?.activeUsers || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Pending Validations
                </span>
                <Badge variant="warning">
                  {stats?.pendingValidations || 0}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/dashboard/user">
                <Button
                  variant="tertiary"
                  className="w-full flex flex-col items-center gap-2 h-20"
                >
                  <Users className="h-5 w-5" />
                  <span className="text-xs">Users</span>
                </Button>
              </Link>
              <Link href="/dashboard/facility">
                <Button
                  variant="tertiary"
                  className="w-full flex flex-col items-center gap-2 h-20"
                >
                  <Building2 className="h-5 w-5" />
                  <span className="text-xs">Facilities</span>
                </Button>
              </Link>
              <Link href="/dashboard/validation-hub">
                <Button
                  variant="tertiary"
                  className="w-full flex flex-col items-center gap-2 h-20"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-xs">Validation</span>
                </Button>
              </Link>
              <Link href="/dashboard/alert">
                <Button
                  variant="tertiary"
                  className="w-full flex flex-col items-center gap-2 h-20"
                >
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-xs">Alerts</span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Distribution by Role */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              User Distribution by Role
            </h3>
            <BarChart
              data={(chartData?.usersByRole || []).map((item) => ({
                name: item.role.replace("_", " "),
                value: item.count,
              }))}
              height={260}
            />
          </Card>

          {/* Facility Distribution by District */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Facilities by District
            </h3>
            <MapVisualization
              data={(chartData?.facilitiesByDistrict || []).map((item) => ({
                district: item.district,
                value: item.count,
              }))}
              height={260}
            />
          </Card>
        </div>

        {/* Case Trends */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Case Trends (Last 30 Days)
          </h3>
          <LineChart
            data={(chartData?.caseTrends || []).map((item) => ({
              name: item.date,
              value: item.cases,
            }))}
            height={260}
            emptyMessage={`No case trend data yet. Total cases in period: ${
              chartData?.caseTrends.reduce((sum, item) => sum + item.cases, 0) || 0
            }`}
          />
        </Card>

        {/* Recent Activity Log */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent System Activity
          </h3>
          <div className="space-y-4">
            {stats?.recentActivity.length ? (
              stats.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <Activity className="h-4 w-4 text-blue-500 mt-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {activity.user} •{" "}
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="secondary" size="sm">
                    {activity.type}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
