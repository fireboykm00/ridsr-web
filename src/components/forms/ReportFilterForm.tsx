// src/components/forms/ReportFilterForm.tsx
'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { SearchableSelect, SelectOption } from '@/components/ui/SearchableSelect';
import { Button } from '@/components/ui/Button';
import { RwandaDistrictType, RWANDA_DISTRICTS } from '@/types';
import { DISEASE_CODES } from '@/constants';

interface ReportFilterFormProps {
  onSubmit: (filters: ReportFilters) => void;
  onCancel: () => void;
}

interface ReportFilters {
  reportType: string;
  facilityId?: string;
  district?: RwandaDistrictType;
  startDate: string;
  endDate: string;
  diseaseCode?: string;
  status?: string;
  includeTrends: boolean;
  includeMaps: boolean;
  includeRecommendations: boolean;
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

const ReportFilterForm: React.FC<ReportFilterFormProps> = ({ onSubmit, onCancel }) => {
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: 'daily_facility',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    includeTrends: true,
    includeMaps: true,
    includeRecommendations: true,
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

  const searchDistricts = async (query: string): Promise<SelectOption[]> => {
    const districts = Object.entries(RWANDA_DISTRICTS).map(([key, value]) => ({
      value: value,
      label: key.charAt(0) + key.slice(1).toLowerCase()
    }));

    if (!query.trim()) return districts;

    return districts.filter(d =>
      d.label.toLowerCase().includes(query.toLowerCase()) ||
      d.value.toLowerCase().includes(query.toLowerCase())
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!filters.reportType) {
      newErrors.reportType = 'Report type is required';
    }

    if (!filters.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!filters.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (new Date(filters.startDate) > new Date(filters.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(filters);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            onChange={(value) => setFilters(prev => ({ ...prev, facilityId: value || undefined }))}
            onSearch={searchFacilities}
            placeholder="Search facilities..."
            isClearable
          />
        </div>

        <div>
          <SearchableSelect
            label="District"
            value={filters.district}
            onChange={(value) => setFilters(prev => ({ ...prev, district: value as RwandaDistrictType || undefined }))}
            onSearch={searchDistricts}
            placeholder="Search districts..."
            isClearable
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

  

      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          Generate Report
        </Button>
      </div>
    </form>
  );
};

export default ReportFilterForm;
