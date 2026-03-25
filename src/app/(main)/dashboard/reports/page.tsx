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
  validationStatus?: string;
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

const VALIDATION_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'validated', label: 'Validated' },
  { value: 'rejected', label: 'Rejected' },
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
    setFilters(prev => ({ ...prev, facilityId: value || undefined }));
    setPreviewData(null);
    clearError('facilityId');
  };

  const searchFacilities = async (query: string): Promise<SelectOption[]> => {
    const searchQuery = query.trim() || 'a';
    
    try {
      const params = new URLSearchParams({ q: searchQuery, limit: '50' });
      if (filters.district) {
        params.append('district', filters.district);
      }
      
      const response = await fetch(`/api/facilities/search?${params.toString()}`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        return data.data
          .filter((f: { _id?: string; id?: string }) => f._id || f.id)
          .map((facility: { _id?: string; id?: string; name: string; code: string }) => ({
            value: facility._id || facility.id,
            label: `${facility.name} (${facility.code})`
          }));
      }
      return [];
    } catch (error) {
      console.error('Error searching facilities:', error);
      return [];
    }
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
    const isAllFacilities = filters.facilityId === 'all';
    
    if (visibleFields.district && level === 'district' && !filters.district) {
      newErrors.district = 'District is required for district reports';
    }
    
    if (visibleFields.facility && level === 'facility' && !filters.facilityId && !isAllFacilities &&
        userRole !== USER_ROLES.HEALTH_WORKER && userRole !== USER_ROLES.LAB_TECHNICIAN) {
      newErrors.facilityId = 'Please select a facility';
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
      const facilityId = filters.facilityId === 'all' ? undefined : filters.facilityId;
      
      const requestBody = {
        reportType: filters.reportType,
        facilityId,
        district: filters.district,
        diseaseCode: filters.diseaseCode,
        status: filters.status,
        validationStatus: filters.validationStatus,
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
      const facilityId = filters.facilityId === 'all' ? undefined : filters.facilityId;
      
      const requestBody = {
        reportType: filters.reportType,
        facilityId,
        district: filters.district,
        diseaseCode: filters.diseaseCode,
        status: filters.status,
        validationStatus: filters.validationStatus,
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
        cases: reportData.cases
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to generate reports.</p>
        </Card>
      </div>
    );
  }

  const visibleFields = getVisibleFields();
  const reportLevel = getReportLevel(filters.reportType);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Generate Reports</h1>
          <p className="mt-2 text-muted-foreground">
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
                <p className="mt-1 text-xs text-muted-foreground">
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
                    placeholder={filters.district ? 'Search in district...' : 'Search or select facility...'}
                    isClearable
                    error={errors.facilityId}
                  />
                  {filters.district && (
                    <p className="mt-1 text-xs text-primary">
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
                    <p className="mt-1 text-xs text-muted-foreground">
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
                <SearchableSelect
                  label="Validation Status"
                  value={filters.validationStatus}
                  onChange={(value) => { setFilters(prev => ({ ...prev, validationStatus: value || undefined })); setPreviewData(null); }}
                  options={VALIDATION_OPTIONS}
                  placeholder="All validations..."
                  isClearable
                />
              </div>

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

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
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
            <h2 className="text-lg font-semibold text-foreground mb-4">Report Preview</h2>
            <div className="bg-primary/5 border border-primary/20 rounded-md p-4 mb-4">
              <div className="text-center">
                <span className="text-3xl font-bold text-primary">{previewData.total}</span>
                <p className="text-sm text-primary mt-1">Total cases match your filters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-foreground/80 mb-2">By Status</h3>
                <div className="space-y-1">
                  {Object.entries(previewData.byStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between text-sm">
                      <span className="capitalize text-muted-foreground">{status}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                  {Object.keys(previewData.byStatus).length === 0 && (
                    <p className="text-sm text-muted-foreground/60">No data</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground/80 mb-2">By Validation</h3>
                <div className="space-y-1">
                  {Object.entries(previewData.byValidation).map(([status, count]) => (
                    <div key={status} className="flex justify-between text-sm">
                      <span className="capitalize text-muted-foreground">{status}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                  {Object.keys(previewData.byValidation).length === 0 && (
                    <p className="text-sm text-muted-foreground/60">No data</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground/80 mb-2">Top Diseases</h3>
                <div className="space-y-1">
                  {Object.entries(previewData.byDisease)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([disease, count]) => (
                      <div key={disease} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate max-w-[120px]">{DISEASE_CODES.find(d => d.code === disease)?.name || disease}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  {Object.keys(previewData.byDisease).length === 0 && (
                    <p className="text-sm text-muted-foreground/60">No data</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
          <h3 className="text-sm font-medium text-primary mb-2">Report Information</h3>
          <ul className="text-sm text-primary space-y-1">
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
