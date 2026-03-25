'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import {
  BuildingOfficeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { USER_ROLES, RwandaDistrictType } from '@/types';

interface DistrictStats {
  totalFacilities: number;
  totalUsers: number;
  totalCases: number;
  activeCases: number;
  pendingCases: number;
}

interface FacilitySummary {
  id: string;
  name: string;
  type: string;
  district: string;
}

interface CaseSummary {
  id: string;
  diseaseCode: string;
  validationStatus: string;
  status: string;
  reportDate: string;
}

interface FacilityApiRecord {
  _id?: string;
  id?: string;
  name?: string;
  type?: string;
  district?: string;
}

interface UserApiEnvelope {
  data?: { data?: unknown[] } | unknown[];
}

interface CaseApiRecord {
  _id?: string;
  id?: string;
  diseaseCode?: string;
  validationStatus?: string;
  status?: string;
  reportDate?: string;
}

export default function DistrictDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const district = params.district as RwandaDistrictType;

  const [stats, setStats] = useState<DistrictStats>({
    totalFacilities: 0,
    totalUsers: 0,
    totalCases: 0,
    activeCases: 0,
    pendingCases: 0,
  });
  const [facilities, setFacilities] = useState<FacilitySummary[]>([]);
  const [recentCases, setRecentCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (status !== 'authenticated' || !session?.user) return;

      const role = session.user.role;
      const canAccess = session.user?.role && [
        USER_ROLES.ADMIN,
        USER_ROLES.NATIONAL_OFFICER,
        USER_ROLES.DISTRICT_OFFICER,
      ].includes(session.user.role as any);

      if (!canAccess) {
        router.replace('/dashboard');
        return;
      }

      if (role === USER_ROLES.DISTRICT_OFFICER && session.user.district !== district) {
        setError('Access denied. You can only view your assigned district.');
        setLoading(false);
        return;
      }

      try {
        const [facilitiesRes, casesRes, usersRes] = await Promise.all([
          fetch(`/api/facilities?district=${district}&limit=100`),
          fetch(`/api/cases?district=${district}&limit=100`),
          fetch(`/api/users?district=${district}&limit=200`),
        ]);

        const facilitiesJson = facilitiesRes.ok ? await facilitiesRes.json() : { data: { data: [] } };
        const casesJson = casesRes.ok ? await casesRes.json() : { data: { data: [] } };
        const usersJson = usersRes.ok ? (await usersRes.json() as UserApiEnvelope) : { data: { data: [] } };

        const districtFacilities: FacilityApiRecord[] = facilitiesJson.data?.data || facilitiesJson.data || [];
        const districtCases: CaseApiRecord[] = casesJson.data?.data || casesJson.data || [];
        const usersRaw = usersJson.data;
        const districtUsers: unknown[] = Array.isArray(usersRaw)
          ? usersRaw
          : Array.isArray(usersRaw?.data)
            ? usersRaw.data
            : [];

        setFacilities(
          districtFacilities.map((f) => ({
            id: f._id || f.id || '',
            name: f.name || 'Unknown Facility',
            type: f.type || 'unknown',
            district: f.district || district,
          }))
        );

        const normalizedCases: CaseSummary[] = districtCases.map((c) => ({
          id: c._id || c.id || '',
          diseaseCode: c.diseaseCode || 'unknown',
          validationStatus: c.validationStatus || 'pending',
          status: c.status || 'suspected',
          reportDate: c.reportDate || new Date().toISOString(),
        }));

        normalizedCases.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
        setRecentCases(normalizedCases.slice(0, 8));

        setStats({
          totalFacilities: districtFacilities.length,
          totalUsers: districtUsers.length,
          totalCases: normalizedCases.length,
          activeCases: normalizedCases.filter((c) => c.status === 'confirmed' || c.status === 'suspected').length,
          pendingCases: normalizedCases.filter((c) => c.validationStatus === 'pending').length,
        });
      } catch (err) {
        console.error('Error loading district details:', err);
        setError('Failed to load district details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [status, session, district, router]);

  const districtLabel = useMemo(
    () => district.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    [district]
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-lg text-center">
          <h1 className="text-2xl font-bold text-foreground mb-3">Access Error</h1>
          <p className="text-muted-foreground mb-5">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Breadcrumbs items={[{ label: 'Districts', href: '/dashboard/district' }, { label: districtLabel }]} />
        <section className="rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-primary mb-2">District Detail</p>
              <h1 className="text-3xl font-bold text-foreground mb-2">{districtLabel}</h1>
              <p className="text-muted-foreground">Operational view for facilities, users, and surveillance activity.</p>
            </div>
            <MapPinIcon className="h-12 w-12 text-primary" />
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Facilities</p>
          <p className="text-2xl font-bold text-foreground">{stats.totalFacilities}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Users</p>
          <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Total Cases</p>
          <p className="text-2xl font-bold text-foreground">{stats.totalCases}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Pending Validation</p>
          <p className="text-2xl font-bold text-foreground">{stats.pendingCases}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BuildingOfficeIcon className="h-5 w-5 text-primary" />
            Facility Network
          </h2>
          <div className="space-y-3">
            {facilities.length === 0 && <p className="text-muted-foreground">No facilities found for this district.</p>}
            {facilities.map((facility) => (
              <div key={facility.id} className="rounded-md bg-muted p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{facility.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{facility.type.replace(/_/g, ' ')}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => router.push(`/dashboard/facility/${facility.id}`)}>
                  Open
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-cyan-700" />
            Recent Case Activity
          </h2>
          <div className="space-y-3">
            {recentCases.length === 0 && <p className="text-muted-foreground">No cases recorded yet.</p>}
            {recentCases.map((caseItem) => (
              <div key={caseItem.id} className="rounded-md bg-muted p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-foreground">{caseItem.diseaseCode}</p>
                  <span className="text-xs text-muted-foreground">{new Date(caseItem.reportDate).toLocaleDateString()}</span>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-4">
                  <span className="capitalize">Status: {caseItem.status}</span>
                  <span className="capitalize">Validation: {caseItem.validationStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
          Response Focus
        </h2>
        <p className="text-muted-foreground">
          {stats.pendingCases > 0
            ? `There are ${stats.pendingCases} pending cases that need validation review in ${districtLabel}.`
            : `No pending validation backlog right now in ${districtLabel}.`}
        </p>
      </Card>
    </div>
  );
}
