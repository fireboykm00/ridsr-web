'use client';

import { useMemo, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MapPinIcon, BuildingOfficeIcon, DocumentTextIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { USER_ROLES, RWANDA_DISTRICTS, RwandaDistrictType } from '@/types';

interface FacilityRecord {
  district?: RwandaDistrictType;
}

interface CaseRecord {
  district?: RwandaDistrictType;
  validationStatus?: string;
}

interface DistrictSummary {
  district: RwandaDistrictType;
  facilities: number;
  totalCases: number;
  pendingCases: number;
}

export default function DistrictsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [districtsData, setDistrictsData] = useState<DistrictSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) {
      return;
    }

    const role = session.user.role;
    const district = session.user.district;

    if ([USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER].includes(role as string)) {
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
        const [facilitiesRes, casesRes] = await Promise.all([
          fetch('/api/facilities?limit=200'),
          fetch('/api/cases?limit=500'),
        ]);

        const facilitiesJson = facilitiesRes.ok ? await facilitiesRes.json() : { data: { data: [] } };
        const casesJson = casesRes.ok ? await casesRes.json() : { data: { data: [] } };

        const facilities: FacilityRecord[] = facilitiesJson.data?.data || facilitiesJson.data || [];
        const cases: CaseRecord[] = casesJson.data?.data || casesJson.data || [];

        const allDistricts = Object.values(RWANDA_DISTRICTS) as RwandaDistrictType[];
        const summary = allDistricts.map((districtName) => {
          const districtFacilities = facilities.filter((f) => f.district === districtName);
          const districtCases = cases.filter((c) => c.district === districtName);
          return {
            district: districtName,
            facilities: districtFacilities.length,
            totalCases: districtCases.length,
            pendingCases: districtCases.filter((c) => c.validationStatus === 'pending').length,
          };
        });

        setDistrictsData(summary);
      } catch (error) {
        console.error('Failed loading district summaries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDistricts();
  }, [status, session, router]);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700" />
      </div>
    );
  }

  if (!session?.user || ![USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER].includes(session.user.role as string)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only available for national-level roles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="uppercase tracking-[0.2em] text-xs text-blue-700 mb-2">National Oversight</p>
            <h1 className="text-3xl font-bold text-gray-900">District Intelligence Map</h1>
            <p className="text-gray-600 mt-2">Click a district to open details and operational metrics.</p>
          </div>
          <MapPinIcon className="h-12 w-12 text-blue-500" />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-gray-500">Districts</p>
          <p className="text-2xl font-bold text-gray-900">{districtsData.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-500">Facilities</p>
          <p className="text-2xl font-bold text-gray-900">{totals.facilities}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-500">Pending Cases</p>
          <p className="text-2xl font-bold text-gray-900">{totals.pending}</p>
        </Card>
      </div>

      <Card className="p-5">
        <Input
          placeholder="Search district..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((d) => (
          <Card key={d.district} className="p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">{d.district}</h3>
              <Button size="sm" onClick={() => router.push(`/dashboard/district/${d.district}`)}>
                Open
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-gray-700">
                <BuildingOfficeIcon className="h-4 w-4" />
                {d.facilities} facilities
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <DocumentTextIcon className="h-4 w-4" />
                {d.totalCases} total cases
              </p>
              <p className="flex items-center gap-2 text-gray-700">
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
