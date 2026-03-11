'use client';

import { useState } from 'react';
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
}

const REPORT_TYPES = [
  { value: 'daily_facility', label: 'Daily Facility Report' },
  { value: 'weekly_facility', label: 'Weekly Facility Report' },
  { value: 'monthly_facility', label: 'Monthly Facility Report' },
  { value: 'weekly_district', label: 'Weekly District Summary' },
  { value: 'monthly_district', label: 'Monthly District Summary' },
  { value: 'quarterly_district', label: 'Quarterly District Summary' },
  { value: 'monthly_national', label: 'Monthly National Report' },
  { value: 'quarterly_national', label: 'Quarterly National Report' },
  { value: 'annual_national', label: 'Annual National Report' },
];

const STATUS_OPTIONS = [
  { value: 'suspected', label: 'Suspected' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'invalidated', label: 'Invalidated' },
];

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const searchFacilities = async (query: string): Promise<SelectOption[]> => {
    if (!query.trim()) return [];
    try {
      const response = await fetch(`/api/facilities/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.success ? (data.data as FacilitySearchResult[]).map((facility) => ({
        value: facility.id,
        label: `${facility.name} (${facility.code})`
      })) : [];
    } catch (error) {
      console.error('Error searching facilities:', error);
      return [];
    }
  };

  const handleFacilityChange = (value: string | null | undefined) => {
    setFilters(prev => ({ ...prev, facilityId: value || undefined, facilityName: undefined }));
  };

  const searchDistricts = async (query: string): Promise<SelectOption[]> => {
    const districts = [
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
    if (!query.trim()) return districts;
    return districts.filter(d =>
      d.label.toLowerCase().includes(query.toLowerCase()) ||
      d.value.toLowerCase().includes(query.toLowerCase())
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!filters.reportType) newErrors.reportType = 'Report type is required';
    if (!filters.startDate) newErrors.startDate = 'Start date is required';
    if (!filters.endDate) newErrors.endDate = 'End date is required';
    if (new Date(filters.startDate) > new Date(filters.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const userRole = session.user.role;
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Generate Reports</h1>
          <p className="mt-2 text-gray-600">
            Create PDF reports for disease surveillance cases with custom filters
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SearchableSelect
                  label="Report Type *"
                  value={filters.reportType}
                  onChange={(value) => setFilters(prev => ({ ...prev, reportType: value || '' }))}
                  error={errors.reportType}
                  options={REPORT_TYPES}
                  placeholder="Select a report type"
                />
              </div>

              <div>
                <SearchableSelect
                  label="Facility"
                  value={filters.facilityId}
                  onChange={handleFacilityChange}
                  onSearch={searchFacilities}
                  placeholder="Search facilities..."
                  isClearable
                />
              </div>

              <div>
                <SearchableSelect
                  label="District"
                  value={filters.district}
                  onChange={(value) => setFilters(prev => ({ ...prev, district: value || undefined }))}
                  onSearch={searchDistricts}
                  placeholder="Search districts..."
                  isClearable
                  disabled={!!filters.facilityId}
                />
              </div>

              <div>
                <SearchableSelect
                  label="Disease"
                  value={filters.diseaseCode}
                  onChange={(value) => setFilters(prev => ({ ...prev, diseaseCode: value || undefined }))}
                  options={DISEASE_CODES.map(d => ({ value: d.code, label: d.name }))}
                  placeholder="Select disease..."
                  isClearable
                />
              </div>

              <div>
                <SearchableSelect
                  label="Status"
                  value={filters.status}
                  onChange={(value) => setFilters(prev => ({ ...prev, status: value || undefined }))}
                  options={STATUS_OPTIONS}
                  placeholder="Select status..."
                  isClearable
                />
              </div>

              <div>
                <Input
                  label="Start Date *"
                  name="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={handleChange}
                  error={errors.startDate}
                />
              </div>

              <div>
                <Input
                  label="End Date *"
                  name="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={handleChange}
                  error={errors.endDate}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Cancel
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

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Report Information</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Reports include all case fields: patient info, disease, symptoms, status, validation, and facility details</li>
            <li>• Summary statistics show case counts by status, validation, and disease</li>
            <li>• PDF output includes header with RIDSR branding and ministry information</li>
            <li>• Reports are filtered based on your role and access level</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
