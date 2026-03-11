'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { SearchableSelect, SelectOption } from '@/components/ui/SearchableSelect';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { USER_ROLES } from '@/types';
import { DISEASE_CODES } from '@/constants';
import { generateCaseReportPDF, ReportOptions } from '@/lib/utils/pdfGenerator';

interface ReportFilters {
  reportType: string;
  facilityId?: string;
  facilityName?: string;
  district?: string;
  startDate: string;
  endDate: string;
  diseaseCode?: string;
  status?: string;
}

interface FacilitySearchResult {
  id: string;
  name: string;
  code: string;
  district?: string;
}

interface PreviewData {
  total: number;
  byStatus: Record<string, number>;
  byDisease: Record<string, number>;
  byValidation: Record<string, number>;
}

const DISTRICT_OPTIONS = [
  { value: 'gasabo', label: 'Gasabo' },
  { value: 'kicukiro', label: 'Kicukiro' },
  { value: 'nyarugenge', label: 'Nyarugenge' },
  { value: 'burera', label: 'Burera' },
  { value: 'gakenke', label: 'Gakenke' },
  { value: 'gicumbi', label: 'Gicumbi' },
  { value: 'musanze', label: 'Musanze' },
  { value: 'rulindo', label: 'Rulindo' },
  { value: 'gisagara', label: 'Gisagara' },
  { value: 'huye', label: 'Huye' },
  { value: 'kamonyi', label: 'Kamonyi' },
  { value: 'muhanga', label: 'Muhanga' },
  { value: 'nyamagabe', label: 'Nyamagabe' },
  { value: 'nyanza', label: 'Nyanza' },
  { value: 'nyaruguru', label: 'Nyaruguru' },
  { value: 'ruhango', label: 'Ruhango' },
  { value: 'bugesera', label: 'Bugesera' },
  { value: 'gatsibo', label: 'Gatsibo' },
  { value: 'kayonza', label: 'Kayonza' },
  { value: 'kirehe', label: 'Kirehe' },
  { value: 'ngoma', label: 'Ngoma' },
  { value: 'nyagatare', label: 'Nyagatare' },
  { value: 'rwamagana', label: 'Rwamagana' },
  { value: 'karongi', label: 'Karongi' },
  { value: 'ngororero', label: 'Ngororero' },
  { value: 'nyabihu', label: 'Nyabihu' },
  { value: 'nyamasheke', label: 'Nyamasheke' },
  { value: 'rubavu', label: 'Rubavu' },
  { value: 'rusizi', label: 'Rusizi' },
  { value: 'rutsiro', label: 'Rutsiro' },
];

const REPORT_TYPES = [
  { value: 'daily_facility', label: 'Daily Facility Report', level: 'facility' },
  { value: 'weekly_facility', label: 'Weekly Facility Report', level: 'facility' },
  { value: 'monthly_facility', label: 'Monthly Facility Report', level: 'facility' },
  { value: 'weekly_district', label: 'Weekly District Summary', level: 'district' },
  { value: 'monthly_district', label: 'Monthly District Summary', level: 'district' },
  { value: 'quarterly_district', label: 'Quarterly District Summary', level: 'district' },
  { value: 'monthly_national', label: 'Monthly National Report', level: 'national' },
  { value: 'quarterly_national', label: 'Quarterly National Report', level: 'national' },
  { value: 'annual_national', label: 'Annual National Report', level: 'national' },
];

const STATUS_OPTIONS = [
  { value: 'suspected', label: 'Suspected' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'invalidated', label: 'Invalidated' },
];

const getReportLevel = (reportType: string): string => {
  const report = REPORT_TYPES.find(r => r.value === reportType);
  return report?.level || 'national';
};

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: 'monthly_national',
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const userRole = session?.user?.role;
  const userFacilityId = session?.user?.facilityId;
  const userDistrict = session?.user?.district;

  useEffect(() => {
    if (status === 'authenticated' && userRole) {
      const level = getReportLevel(filters.reportType);
      
      if (level === 'facility' && !filters.facilityId) {
        if (userRole === USER_ROLES.HEALTH_WORKER || userRole === USER_ROLES.LAB_TECHNICIAN) {
          if (userFacilityId) {
            setFilters(prev => ({ ...prev, facilityId: userFacilityId }));
          }
        }
      }
      
      if (level === 'district' && !filters.district) {
        if (userRole === USER_ROLES.DISTRICT_OFFICER && userDistrict) {
          setFilters(prev => ({ ...prev, district: userDistrict }));
        }
      }
    }
  }, [status, userRole, filters.reportType, filters.facilityId, filters.district, userFacilityId, userDistrict]);

  const getVisibleFields = useCallback(() => {
    const level = getReportLevel(filters.reportType);
    
    return {
      facility: level !== 'national',
      district: level !== 'facility',
      disease: true,
      status: true,
      dates: true,
    };
  }, [filters.reportType]);

  const isFieldRequired = useCallback((field: string): boolean => {
    const level = getReportLevel(filters.reportType);
    
    if (field === 'district' && level === 'district') return true;
    if (field === 'facility' && level === 'facility' && 
        (userRole !== USER_ROLES.HEALTH_WORKER && userRole !== USER_ROLES.LAB_TECHNICIAN)) return false;
    
    return false;
  }, [filters.reportType, userRole]);

  const handleReportTypeChange = (value: string | null | undefined) => {
    const newReportType = value || 'monthly_national';
    const newLevel = getReportLevel(newReportType);
    
    const newFilters: ReportFilters = { ...filters, reportType: newReportType };
    
    if (newLevel === 'facility') {
      newFilters.district = undefined;
      if (!newFilters.facilityId && (userRole === USER_ROLES.HEALTH_WORKER || userRole === USER_ROLES.LAB_TECHNICIAN)) {
        newFilters.facilityId = userFacilityId;
      }
    } else if (newLevel === 'district') {
      newFilters.facilityId = undefined;
      if (!newFilters.district && userRole === USER_ROLES.DISTRICT_OFFICER) {
        newFilters.district = userDistrict;
      }
    }
    
    setFilters(newFilters);
    setPreviewData(null);
    clearError('reportType');
  };

  const handleDistrictChange = (value: string | null | undefined) => {
    const newDistrict = value || undefined;
    setFilters(prev => ({ ...prev, district: newDistrict, facilityId: undefined }));
    setPreviewData(null);
    clearError('district');
  };

  const handleFacilityChange = (value: string | null | undefined) => {
    if (value === '__all__') {
      if (userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.NATIONAL_OFFICER) {
        setFilters(prev => ({ ...prev, facilityId: '__all_national__', district: undefined }));
      } else if (userRole === USER_ROLES.DISTRICT_OFFICER && filters.district) {
        setFilters(prev => ({ ...prev, facilityId: '__all_district__' }));
      }
    } else {
      const newFacilityId = value || undefined;
      setFilters(prev => ({ ...prev, facilityId: newFacilityId, district: undefined }));
    }
    setPreviewData(null);
  };

  const getAllFacilitiesOption = (): SelectOption | null => {
    if (userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.NATIONAL_OFFICER) {
      return { value: '__all__', label: 'All Facilities (National)' };
    } else if (userRole === USER_ROLES.DISTRICT_OFFICER && filters.district) {
      const districtName = DISTRICT_OPTIONS.find(d => d.value === filters.district)?.label || '';
      return { value: '__all__', label: `All Facilities (${districtName})` };
    }
    return null;
  };

  const searchFacilities = async (query: string): Promise<SelectOption[]> => {
    const allOption = getAllFacilitiesOption();
    
    if (!query.trim() && !filters.district && !allOption) return [];
    
    try {
      const params = new URLSearchParams({ q: query || 'a' });
      if (filters.district) {
        params.append('district', filters.district);
      }
      
      const response = await fetch(`/api/facilities/search?${params.toString()}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const facilityOptions = (data.data as FacilitySearchResult[]).map((facility) => ({
          value: facility.id,
          label: `${facility.name} (${facility.code})`
        }));
        
        if (allOption) {
          return [allOption, ...facilityOptions];
        }
        return facilityOptions;
      }
      return allOption ? [allOption] : [];
    } catch (error) {
      console.error('Error searching facilities:', error);
      return allOption ? [allOption] : [];
    }
  };

  const shouldShowAllFacilitiesOption = (): boolean => {
    return userRole === USER_ROLES.ADMIN || 
           userRole === USER_ROLES.NATIONAL_OFFICER || 
           (userRole === USER_ROLES.DISTRICT_OFFICER && !!filters.district);
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const level = getReportType(filters.reportType);
    
    if (!filters.reportType) {
      newErrors.reportType = 'Report type is required';
    }
    
    if (!filters.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!filters.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (filters.startDate && filters.endDate && new Date(filters.startDate) > new Date(filters.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    const visibleFields = getVisibleFields();
    const isAllFacilities = filters.facilityId === '__all_national__' || filters.facilityId === '__all_district__';
    
    if (visibleFields.district && level === 'district' && !filters.district) {
      newErrors.district = 'District is required for district reports';
    }
    
    if (visibleFields.facility && level === 'facility' && !filters.facilityId && !isAllFacilities &&
        userRole !== USER_ROLES.HEALTH_WORKER && userRole !== USER_ROLES.LAB_TECHNICIAN) {
      newErrors.facilityId = 'Facility is required for facility reports';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getReportType = (value: string): string => {
    const report = REPORT_TYPES.find(r => r.value === value);
    return report?.level || 'national';
  };

  const fetchPreview = async () => {
    if (!validateForm()) return;

    setIsLoadingPreview(true);
    try {
      const requestBody = {
        reportType: filters.reportType,
        facilityId: filters.facilityId,
        district: filters.district,
        diseaseCode: filters.diseaseCode,
        status: filters.status,
        dateFrom: filters.startDate,
        dateTo: filters.endDate,
      };

      const response = await fetch('/api/reports/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch preview');
      }

      const data = await response.json();
      setPreviewData({
        total: data.summary?.totalCases || 0,
        byStatus: data.summary?.byStatus || {},
        byDisease: data.summary?.byDisease || {},
        byValidation: data.summary?.byValidation || {},
      });
    } catch (error) {
      console.error('Error fetching preview:', error);
      setPreviewData(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const requestBody = {
        reportType: filters.reportType,
        facilityId: filters.facilityId,
        district: filters.district,
        diseaseCode: filters.diseaseCode,
        status: filters.status,
        dateFrom: filters.startDate,
        dateTo: filters.endDate,
      };

      const response = await fetch('/api/reports/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }

      const reportData = await response.json();

      const pdfOptions: ReportOptions = {
        title: reportData.title,
        subtitle: reportData.subtitle,
        dateRange: reportData.dateRange,
        generatedAt: reportData.generatedAt,
        generatedBy: reportData.generatedBy,
        cases: reportData.cases,
        filters: reportData.filters,
      };

      const doc = generateCaseReportPDF(pdfOptions);
      const reportTypeLabel = REPORT_TYPES.find(r => r.value === filters.reportType)?.label || 'Report';
      const fileName = `${reportTypeLabel.replace(/\s+/g, '_')}_${filters.startDate}_to_${filters.endDate}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating report:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!session?.user) {
    router.push('/login');
    return null;
  }

  const canGenerateReport = 
    userRole === USER_ROLES.ADMIN ||
    userRole === USER_ROLES.NATIONAL_OFFICER ||
    userRole === USER_ROLES.DISTRICT_OFFICER;

  if (!canGenerateReport) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to generate reports.</p>
        </Card>
      </div>
    );
  }

  const visibleFields = getVisibleFields();
  const reportLevel = getReportLevel(filters.reportType);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Generate Reports</h1>
          <p className="mt-2 text-gray-600">
            Create PDF reports for disease surveillance cases with custom filters
          </p>
        </div>

        <Card className="p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SearchableSelect
                  label="Report Type *"
                  value={filters.reportType}
                  onChange={handleReportTypeChange}
                  error={errors.reportType}
                  options={REPORT_TYPES.map(r => ({ value: r.value, label: r.label }))}
                  placeholder="Select a report type"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {reportLevel === 'facility' && 'Facility-level reports show cases from a specific health facility'}
                  {reportLevel === 'district' && 'District-level reports show cases from all facilities in a district'}
                  {reportLevel === 'national' && 'National-level reports show all cases across Rwanda'}
                </p>
              </div>

              {visibleFields.facility && (
                <div>
                  <SearchableSelect
                    label={isFieldRequired('facility') ? 'Facility *' : 'Facility'}
                    value={filters.facilityId}
                    onChange={handleFacilityChange}
                    onSearch={searchFacilities}
                    placeholder={filters.district ? 'Search in district...' : 'Search facilities...'}
                    isClearable
                    error={errors.facilityId}
                    showAllOption={shouldShowAllFacilitiesOption()}
                    allOptionLabel={getAllFacilitiesOption()?.label || 'All Facilities'}
                    showSearchOnOpen
                  />
                  {filters.district && (
                    <p className="mt-1 text-xs text-blue-600">
                      Showing facilities in {DISTRICT_OPTIONS.find(d => d.value === filters.district)?.label}
                    </p>
                  )}
                </div>
              )}

              {visibleFields.district && (
                <div>
                  <SearchableSelect
                    label={isFieldRequired('district') ? 'District *' : 'District'}
                    value={filters.district}
                    onChange={handleDistrictChange}
                    options={DISTRICT_OPTIONS}
                    placeholder="Select district..."
                    isClearable
                    disabled={!!filters.facilityId}
                    error={errors.district}
                  />
                  {filters.facilityId && (
                    <p className="mt-1 text-xs text-gray-500">
                      Facility selected - district filter disabled
                    </p>
                  )}
                </div>
              )}

              {visibleFields.disease && (
                <div>
                  <SearchableSelect
                    label="Disease"
                    value={filters.diseaseCode}
                    onChange={(value) => { setFilters(prev => ({ ...prev, diseaseCode: value || undefined })); setPreviewData(null); }}
                    options={DISEASE_CODES.map(d => ({ value: d.code, label: d.name }))}
                    placeholder="All diseases..."
                    isClearable
                  />
                </div>
              )}

              {visibleFields.status && (
                <div>
                  <SearchableSelect
                    label="Case Status"
                    value={filters.status}
                    onChange={(value) => { setFilters(prev => ({ ...prev, status: value || undefined })); setPreviewData(null); }}
                    options={STATUS_OPTIONS}
                    placeholder="All statuses..."
                    isClearable
                  />
                </div>
              )}

              <div>
                <Input
                  label="Start Date *"
                  name="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => { setFilters(prev => ({ ...prev, startDate: e.target.value })); setPreviewData(null); clearError('startDate'); }}
                  error={errors.startDate}
                />
              </div>

              <div>
                <Input
                  label="End Date *"
                  name="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => { setFilters(prev => ({ ...prev, endDate: e.target.value })); setPreviewData(null); clearError('endDate'); }}
                  error={errors.endDate}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={fetchPreview}
                isLoading={isLoadingPreview}
                disabled={isLoading}
              >
                Preview Data
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
              >
                Generate PDF Report
              </Button>
            </div>
          </form>
        </Card>

        {previewData && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="text-center">
                <span className="text-3xl font-bold text-blue-700">{previewData.total}</span>
                <p className="text-sm text-blue-600 mt-1">Total cases match your filters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">By Status</h3>
                <div className="space-y-1">
                  {Object.entries(previewData.byStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between text-sm">
                      <span className="capitalize text-gray-600">{status}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                  {Object.keys(previewData.byStatus).length === 0 && (
                    <p className="text-sm text-gray-400">No data</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">By Validation</h3>
                <div className="space-y-1">
                  {Object.entries(previewData.byValidation).map(([status, count]) => (
                    <div key={status} className="flex justify-between text-sm">
                      <span className="capitalize text-gray-600">{status}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                  {Object.keys(previewData.byValidation).length === 0 && (
                    <p className="text-sm text-gray-400">No data</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Top Diseases</h3>
                <div className="space-y-1">
                  {Object.entries(previewData.byDisease)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([disease, count]) => (
                      <div key={disease} className="flex justify-between text-sm">
                        <span className="text-gray-600 truncate max-w-[120px]">{DISEASE_CODES.find(d => d.code === disease)?.name || disease}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  {Object.keys(previewData.byDisease).length === 0 && (
                    <p className="text-sm text-gray-400">No data</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Report Information</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Reports include all case fields: patient info, disease, symptoms, status, validation, and facility details</li>
            <li>• Summary statistics show case counts by status, validation, and disease</li>
            <li>• PDF output includes header with RIDSR branding and ministry information</li>
            <li>• Reports are filtered based on your role and access level</li>
            <li>• Use &quot;Preview Data&quot; to see filtered results before generating PDF</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
