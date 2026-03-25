'use client';

import { useMemo, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MapPinIcon, BuildingOfficeIcon, DocumentTextIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { USER_ROLES, RWANDA_DISTRICTS, RwandaDistrictType, UserRole } from '@/types';

interface DistrictSummary {
  district: RwandaDistrictType;
  facilities: number;
  totalCases: number;
  pendingCases: number;
}

const nationalRoles: UserRole[] = [USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER];

export default function DistrictsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [districtsData, setDistrictsData] = useState<DistrictSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) {
      return;
    }

    const district = session.user.district;

    if (session.user?.role && nationalRoles.includes(session.user.role as UserRole)) {
      // allowed on this page
    } else if (district) {
      router.replace(`/dashboard/district/${district}`);
      return;
    } else {
      router.replace('/dashboard');
      return;
    }

    const loadDistricts = async () => {
      try {
        const params = new URLSearchParams({ type: 'districts' });
        if (dateFrom) params.set('dateFrom', dateFrom);
        if (dateTo) params.set('dateTo', dateTo);

        const response = await fetch(`/api/dashboard?${params.toString()}`);
        const payload = response.ok ? await response.json() : { data: [] };
        const summary = (payload.data || []) as DistrictSummary[];
        const byDistrict = new Map(summary.map((item) => [item.district, item]));
        const allDistricts = Object.values(RWANDA_DISTRICTS) as RwandaDistrictType[];
        setDistrictsData(
          allDistricts.map((districtName) => byDistrict.get(districtName) || {
            district: districtName,
            facilities: 0,
            totalCases: 0,
            pendingCases: 0,
          }),
        );
      } catch (error) {
        console.error('Failed loading district summaries:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadDistricts();
  }, [status, session, router, dateFrom, dateTo]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return districtsData;
    return districtsData.filter((d) => d.district.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [districtsData, searchTerm]);

  const totals = useMemo(() => {
    return districtsData.reduce(
      (acc, d) => {
        acc.facilities += d.facilities;
        acc.cases += d.totalCases;
        acc.pending += d.pendingCases;
        return acc;
      },
      { facilities: 0, cases: 0, pending: 0 }
    );
  }, [districtsData]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session?.user || !(session.user?.role && nationalRoles.includes(session.user.role as UserRole))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground">This page is only available for national-level roles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="uppercase tracking-[0.2em] text-xs text-primary mb-2">National Oversight</p>
            <h1 className="text-3xl font-bold text-foreground">District Intelligence Map</h1>
            <p className="text-muted-foreground mt-2">Click a district to open details and operational metrics.</p>
          </div>
          <MapPinIcon className="h-12 w-12 text-primary" />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Districts</p>
          <p className="text-2xl font-bold text-foreground">{districtsData.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Facilities</p>
          <p className="text-2xl font-bold text-foreground">{totals.facilities}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Pending Cases</p>
          <p className="text-2xl font-bold text-foreground">{totals.pending}</p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="Search district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((d) => (
          <Card key={d.district} className="p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-foreground capitalize">{d.district}</h3>
              <Button size="sm" onClick={() => router.push(`/dashboard/district/${d.district}`)}>
                Open
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-foreground/80">
                <BuildingOfficeIcon className="h-4 w-4" />
                {d.facilities} facilities
              </p>
              <p className="flex items-center gap-2 text-foreground/80">
                <DocumentTextIcon className="h-4 w-4" />
                {d.totalCases} total cases
              </p>
              <p className="flex items-center gap-2 text-foreground/80">
                <ExclamationTriangleIcon className="h-4 w-4" />
                {d.pendingCases} pending validation
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
