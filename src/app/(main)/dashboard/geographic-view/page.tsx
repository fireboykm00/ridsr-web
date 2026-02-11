// src/app/(main)/dashboard/geographic-view/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { MapVisualization } from '@/components/ui/MapVisualization';
import { USER_ROLES } from '@/types';
import { facilityService } from '@/lib/services/facility-service';

interface RegionData {
  name: string;
  value: number;
  colorIntensity: number;
}

interface FacilityData {
  id: string;
  name: string;
  district: string;
  province: string;
  cases: number;
  type: string;
}

const GeographicView = () => {
  const { data: session, status } = useSession();
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [facilityData, setFacilityData] = useState<FacilityData[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (status === 'authenticated' && session) {
        try {
          // Generate mock data based on user's role and location
          let mockRegionData: RegionData[] = [];
          let mockFacilityData: FacilityData[] = [];

          if (session.user?.role === USER_ROLES.ADMIN) {
            // Admins see all regions
            mockRegionData = [
              { name: 'Kigali City', value: 120, colorIntensity: 0.6 },
              { name: 'Northern Province', value: 89, colorIntensity: 0.5 },
              { name: 'Southern Province', value: 110, colorIntensity: 0.55 },
              { name: 'Eastern Province', value: 78, colorIntensity: 0.4 },
              { name: 'Western Province', value: 135, colorIntensity: 0.7 },
            ];

            mockFacilityData = [
              { id: 'f1', name: 'Kigali Central Hospital', district: 'Gasabo', province: 'Kigali City', cases: 24, type: 'hospital' },
              { id: 'f2', name: 'Ruhengeri District Hospital', district: 'Ruhengeri', province: 'Northern Province', cases: 18, type: 'hospital' },
              { id: 'f3', name: 'Nyanza Health Center', district: 'Nyanza', province: 'Southern Province', cases: 12, type: 'health_center' },
              { id: 'f4', name: 'Kirehe District Hospital', district: 'Kirehe', province: 'Eastern Province', cases: 15, type: 'hospital' },
              { id: 'f5', name: 'Nyamasheke Health Center', district: 'Nyamasheke', province: 'Western Province', cases: 22, type: 'health_center' },
            ];
          } else if (session.user?.role === USER_ROLES.NATIONAL_OFFICER) {
            // National officers see all regions
            mockRegionData = [
              { name: 'Kigali City', value: 85, colorIntensity: 0.45 },
              { name: 'Northern Province', value: 67, colorIntensity: 0.35 },
              { name: 'Southern Province', value: 82, colorIntensity: 0.4 },
              { name: 'Eastern Province', value: 58, colorIntensity: 0.3 },
              { name: 'Western Province', value: 101, colorIntensity: 0.5 },
            ];

            mockFacilityData = [
              { id: 'f1', name: 'Kigali Central Hospital', district: 'Gasabo', province: 'Kigali City', cases: 18, type: 'hospital' },
              { id: 'f2', name: 'Ruhengeri District Hospital', district: 'Ruhengeri', province: 'Northern Province', cases: 14, type: 'hospital' },
              { id: 'f3', name: 'Nyanza Health Center', district: 'Nyanza', province: 'Southern Province', cases: 9, type: 'health_center' },
            ];
          } else if (session.user?.role === USER_ROLES.DISTRICT_OFFICER && session.user.district) {
            // District officers see their region
            const regionValue = Math.floor(Math.random() * 50) + 20;
            mockRegionData = [
              { name: session.user.district, value: regionValue, colorIntensity: regionValue / 100 },
            ];

            // Get facilities in the district
            const districtFacilities = await facilityService.getFacilitiesByDistrict(session.user.district);
            mockFacilityData = districtFacilities.map((facility, index) => ({
              id: facility.id,
              name: facility.name,
              district: facility.district,
              province: facility.province,
              cases: Math.floor(Math.random() * 20) + 5,
              type: facility.type
            }));
          } else if ([USER_ROLES.HEALTH_WORKER, USER_ROLES.LAB_TECHNICIAN].includes(session.user?.role as string) && session.user.facilityId) {
            // Health workers and lab technicians see their facility
            const facility = await facilityService.getFacilityById(session.user.facilityId);
            if (facility) {
              mockRegionData = [
                { name: facility.district, value: Math.floor(Math.random() * 30) + 10, colorIntensity: 0.2 },
              ];

              mockFacilityData = [{
                id: facility.id,
                name: facility.name,
                district: facility.district,
                province: facility.province,
                cases: Math.floor(Math.random() * 15) + 5,
                type: facility.type
              }];
            }
          }

          setRegionData(mockRegionData);
          setFacilityData(mockFacilityData);
        } catch (error) {
          console.error('Error loading geographic data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [status, session]);

  const handleRegionClick = (region: { name: string; value: number; colorIntensity: number }) => {
    setSelectedRegion(region.name);
  };

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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Geographic View</h1>
        <p className="text-gray-600">
          {session.user?.role === USER_ROLES.DISTRICT_OFFICER
            ? `Geographic distribution in ${session.user?.district} district`
            : session.user?.role === USER_ROLES.HEALTH_WORKER || session.user?.role === USER_ROLES.LAB_TECHNICIAN
              ? `Geographic view for your facility area`
              : 'National geographic distribution of cases'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rwanda Geographic Distribution</h2>
            <MapVisualization
              regions={regionData}
              onRegionClick={handleRegionClick}
            />
          </Card>
        </div>

        <div className="space-y-8">
          {/* Selected Region Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedRegion ? `${selectedRegion} Details` : 'Select a Region'}
            </h2>
            {selectedRegion ? (
              <div>
                <p className="text-gray-600 mb-4">
                  Detailed information for the selected region
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Cases:</span>
                    <span className="font-medium">
                      {regionData.find(r => r.name === selectedRegion)?.value || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Outbreaks:</span>
                    <span className="font-medium">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Facilities Monitored:</span>
                    <span className="font-medium">
                      {facilityData.filter(f => f.district === selectedRegion).length}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">
                Click on a region in the map to view details
              </p>
            )}
          </Card>

          {/* Facilities in Region */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Facilities</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {facilityData.length > 0 ? (
                facilityData.map(facility => (
                  <div
                    key={facility.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-900">{facility.name}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        {facility.cases} cases
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {facility.district}, {facility.province}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {facility.type.charAt(0).toUpperCase() + facility.type.slice(1)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-4">
                  No facilities available
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Geographic Trends */}
      <Card className="mt-8 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Geographic Trends</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800">Highest Incidence</h3>
            <p className="text-2xl font-bold text-blue-700">
              {regionData.length > 0
                ? `${Math.max(...regionData.map(r => r.value))} cases`
                : 'N/A'}
            </p>
            <p className="text-sm text-blue-600">
              {regionData.length > 0
                ? regionData.find(r => r.value === Math.max(...regionData.map(r => r.value)))?.name
                : 'Calculating...'}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800">Lowest Incidence</h3>
            <p className="text-2xl font-bold text-green-700">
              {regionData.length > 0
                ? `${Math.min(...regionData.map(r => r.value))} cases`
                : 'N/A'}
            </p>
            <p className="text-sm text-green-600">
              {regionData.length > 0
                ? regionData.find(r => r.value === Math.min(...regionData.map(r => r.value)))?.name
                : 'Calculating...'}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-800">Avg. Per Region</h3>
            <p className="text-2xl font-bold text-yellow-700">
              {regionData.length > 0
                ? `${Math.round(regionData.reduce((sum, r) => sum + r.value, 0) / regionData.length)} cases`
                : 'N/A'}
            </p>
            <p className="text-sm text-yellow-600">Across all regions</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GeographicView;