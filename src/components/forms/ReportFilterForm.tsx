// src/components/forms/ReportFilterForm.tsx
'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';

interface ReportFilterFormProps {
  onSubmit: (filters: ReportFilters) => void;
  onCancel: () => void;
}

interface ReportFilters {
  reportType: string;
  facilityId?: string;
  districtId?: string;
  startDate: string;
  endDate: string;
  diseaseCodes: string[];
  includeTrends: boolean;
  includeMaps: boolean;
  includeRecommendations: boolean;
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

const DISEASE_CODES = [
  { value: 'CHOLERA', label: 'Cholera' },
  { value: 'MAL01', label: 'Malaria' },
  { value: 'SARI', label: 'Severe Acute Respiratory Illness' },
  { value: 'AFP', label: 'Acute Flaccid Paralysis' },
  { value: 'YELLOW_FEVER', label: 'Yellow Fever' },
  { value: 'RUBELLA', label: 'Rubella' },
  { value: 'MEASLES', label: 'Measles' },
  { value: 'PLAGUE', label: 'Plague' },
  { value: 'RABIES', label: 'Rabies' },
  { value: 'EBOLA', label: 'Ebola Virus Disease' },
  { value: 'MONKEYPOX', label: 'Monkeypox' },
];

const ReportFilterForm: React.FC<ReportFilterFormProps> = ({ onSubmit, onCancel }) => {
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: 'daily_facility',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    diseaseCodes: [],
    includeTrends: true,
    includeMaps: true,
    includeRecommendations: true,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFilters(prev => ({ ...prev, [name]: val }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDiseaseChange = (diseaseCode: string) => {
    setFilters(prev => {
      if (prev.diseaseCodes.includes(diseaseCode)) {
        return {
          ...prev,
          diseaseCodes: prev.diseaseCodes.filter(code => code !== diseaseCode)
        };
      } else {
        return {
          ...prev,
          diseaseCodes: [...prev.diseaseCodes, diseaseCode]
        };
      }
    });
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
          <Select
            label="Report Type *"
            name="reportType"
            value={filters.reportType}
            onChange={(value) => setFilters(prev => ({ ...prev, reportType: value }))}
            error={errors.reportType}
          >
            <option value="">Select a report type</option>
            {REPORT_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
        </div>
        
        <div>
          <Input
            label="Facility ID"
            name="facilityId"
            value={filters.facilityId || ''}
            onChange={handleChange}
            placeholder="Filter by facility (optional)"
          />
        </div>
        
        <div>
          <Input
            label="District ID"
            name="districtId"
            value={filters.districtId || ''}
            onChange={handleChange}
            placeholder="Filter by district (optional)"
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
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Disease Codes
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {DISEASE_CODES.map(disease => (
            <div key={disease.value} className="flex items-center">
              <Checkbox
                id={disease.value}
                checked={filters.diseaseCodes.includes(disease.value)}
                onChange={() => handleDiseaseChange(disease.value)}
              />
              <label htmlFor={disease.value} className="ml-2 block text-sm text-gray-700">
                {disease.label}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Include in Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <Checkbox
              id="includeTrends"
              name="includeTrends"
              checked={filters.includeTrends}
              onChange={(checked) => setFilters(prev => ({ ...prev, includeTrends: checked }))}
            />
            <label htmlFor="includeTrends" className="ml-2 block text-sm text-gray-900">
              Trends Analysis
            </label>
          </div>
          
          <div className="flex items-center">
            <Checkbox
              id="includeMaps"
              name="includeMaps"
              checked={filters.includeMaps}
              onChange={(checked) => setFilters(prev => ({ ...prev, includeMaps: checked }))}
            />
            <label htmlFor="includeMaps" className="ml-2 block text-sm text-gray-900">
              Geographic Maps
            </label>
          </div>
          
          <div className="flex items-center">
            <Checkbox
              id="includeRecommendations"
              name="includeRecommendations"
              checked={filters.includeRecommendations}
              onChange={(checked) => setFilters(prev => ({ ...prev, includeRecommendations: checked }))}
            />
            <label htmlFor="includeRecommendations" className="ml-2 block text-sm text-gray-900">
              Recommendations
            </label>
          </div>
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