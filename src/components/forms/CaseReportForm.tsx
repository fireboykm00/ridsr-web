// src/components/forms/CaseReportForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { SearchableSelect, SelectOption } from '@/components/ui/SearchableSelect';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import { FormFieldset } from '@/components/ui/FormFieldset';
import { useSession } from 'next-auth/react';
import { useToastHelpers } from '@/components/ui/Toast';
import { CaseReportFormData } from '@/types/forms';
import { DiseaseCode, Symptom, Facility } from '@/types';
import { DISEASE_CODES, COMMON_SYMPTOMS } from '@/constants';
import { facilityService } from '@/lib/services/facilityService';

interface CaseReportFormProps {
  onCancel?: () => void;
  initialData?: Partial<CaseReportFormData>;
}

const CaseReportForm: React.FC<CaseReportFormProps> = ({
  onCancel,
  initialData,
}) => {
  const { data: session } = useSession();
  const { success, error } = useToastHelpers();

  const [formData, setFormData] = useState<CaseReportFormData>({
    patientId: initialData?.patientId || '',
    diseaseCode: (initialData?.diseaseCode as DiseaseCode) || '' as DiseaseCode,
    onsetDate: initialData?.onsetDate ? new Date(initialData.onsetDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    symptoms: (initialData?.symptoms as Symptom[]) || [],
    facilityId: initialData?.facilityId || session?.user?.facilityId || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<typeof DISEASE_CODES[0] | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);

  // Update selected disease when disease code changes
  useEffect(() => {
    const disease = DISEASE_CODES.find(d => d.code === formData.diseaseCode);
    setSelectedDisease(disease || null);
  }, [formData.diseaseCode]);

  // Load facilities if facility selection is allowed
  useEffect(() => {
    const loadFacilities = async () => {
      try {
        const allFacilities = await facilityService.getAllFacilities();

        setFacilities(allFacilities);
      } catch (error) {
        console.error('Error loading facilities:', error);
        setErrors(prev => ({
          ...prev,
          facilityId: 'Failed to load facilities. Please refresh the page.'
        }));
      }
    };


    loadFacilities();

  }, []);

  const searchPatients = async (query: string): Promise<SelectOption<string>[]> => {
    if (!query || query.length < 2) return [];

    setIsSearchingPatients(true);
    try {
      const response = await fetch(`/api/patients/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search patients');

      let result = await response.json();
      // The API returns the options array directly, not wrapped in a 'data' property

      return result.data || [];
    } catch (error) {
      console.error('Patient search error:', error);
      return [];
    } finally {
      setIsSearchingPatients(false);
    }
  };

  const handleSymptomChange = (symptom: Symptom) => {
    setFormData(prev => {
      const newSymptoms = prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom];

      return { ...prev, symptoms: newSymptoms };
    });

    // Clear symptoms error if at least one symptom is selected
    if (errors.symptoms && formData.symptoms.length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.symptoms;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId.trim()) {
      newErrors.patientId = 'Patient selection is required';
    }

    if (!formData.diseaseCode) {
      newErrors.diseaseCode = 'Disease selection is required';
    }

    if (!formData.onsetDate) {
      newErrors.onsetDate = 'Onset date is required';
    } else {
      const onsetDate = new Date(formData.onsetDate);
      const today = new Date();
      if (onsetDate > today) {
        newErrors.onsetDate = 'Onset date cannot be in the future';
      }
    }

    if (formData.symptoms.length === 0) {
      newErrors.symptoms = 'At least one symptom must be selected';
    }

    // Validate facility selection
    if (!formData.facilityId) {
      newErrors.facilityId = 'Facility selection is required';
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
      // Always make the API call
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit case report');
      }

      await response.json();

      success('Case report submitted successfully!');

      // Reset form
      setFormData({
        patientId: '',
        diseaseCode: '',
        onsetDate: new Date().toISOString().split('T')[0],
        symptoms: [],
        facilityId: session?.user?.facilityId || '',
      });
    } catch (err) {
      console.error('Error submitting form:', err);
      error(err instanceof Error ? err.message : 'Failed to submit case report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      patientId: '',
      diseaseCode: '',
      onsetDate: new Date().toISOString().split('T')[0],
      symptoms: [],
      facilityId: session?.user?.facilityId || '',
    });
    setErrors({});
  };

  return (
    <Card className="p-6">
      {session?.user?.facilityId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Reporting Facility:</span> {session.user.facilityId}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormFieldset legend="Case Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {session?.user?.role !== "lab_technician" &&
              <div>
                <SearchableSelect<string>
                  label="Facility *"
                  value={formData.facilityId}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, facilityId: value || '' }));
                    if (errors.facilityId) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.facilityId;
                        return newErrors;
                      });
                    }
                  }}
                  options={facilities.map(facility => ({
                    value: facility.code,
                    label: `${facility.name} - ${facility.district}`
                  }))}
                  error={errors.facilityId}
                  placeholder={facilities.length > 0 ? "Select a facility..." : "Loading facilities..."}
                  isClearable
                  isLoading={facilities.length === 0}
                />
              </div>
            }

            <div>
              <SearchableSelect<string>
                label="Patient *"
                value={formData.patientId}
                onChange={(value) => {
                  setFormData(prev => ({ ...prev, patientId: value || '' }));
                  if (errors.patientId) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.patientId;
                      return newErrors;
                    });
                  }
                }}
                onSearch={searchPatients}
                isLoading={isSearchingPatients}
                isClearable
                error={errors.patientId}
                placeholder="Search by name or National ID..."
                helperText="Type at least 2 characters to search"
              />
            </div>

            <div>
              <SearchableSelect<string>
                label="Disease *"
                value={formData.diseaseCode}
                onChange={(value) => {
                  setFormData(prev => ({ ...prev, diseaseCode: value || '' }));
                  if (errors.diseaseCode) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.diseaseCode;
                      return newErrors;
                    });
                  }
                }}
                error={errors.diseaseCode}
                options={DISEASE_CODES.map(disease => ({
                  value: disease.code,
                  label: `${disease.name} (${disease.code})${disease.priority === 'high' ? ' ⚠️' : ''}`
                }))}
                isClearable
                placeholder="Select disease..."
              />
              {selectedDisease?.priority === 'high' && (
                <p className="mt-1 text-sm text-orange-600 font-medium">
                  ⚠️ High-priority disease
                </p>
              )}
            </div>

            <div>
              <Input
                label="Symptom Onset Date *"
                type="date"
                value={formData.onsetDate}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, onsetDate: e.target.value }));
                  if (errors.onsetDate) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.onsetDate;
                      return newErrors;
                    });
                  }
                }}
                error={errors.onsetDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </FormFieldset>

        <FormFieldset legend="Clinical Symptoms">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select all symptoms present *
              {errors.symptoms && <span className="text-red-600 ml-2">{errors.symptoms}</span>}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {COMMON_SYMPTOMS.map(symptom => (
                <div key={symptom.id} className="flex items-center">
                  <Checkbox
                    id={symptom.id}
                    checked={formData.symptoms.includes(symptom.id)}
                    onChange={() => handleSymptomChange(symptom.id)}
                  />
                  <label htmlFor={symptom.id} className="ml-2 block text-sm text-gray-700 capitalize cursor-pointer">
                    {symptom.label}
                  </label>
                </div>
              ))}
            </div>
            {formData.symptoms.length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Selected symptoms ({formData.symptoms.length}):</span>{' '}
                  {formData.symptoms.map(s => s.replace(/_/g, ' ')).join(', ')}
                </p>
              </div>
            )}
          </div>
        </FormFieldset>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          {errors.general && (
            <p className="text-red-600 text-sm mt-2">{errors.general}</p>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel || handleReset}
            disabled={isLoading}
          >
            {onCancel ? 'Cancel' : 'Reset Form'}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            Submit Case Report
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CaseReportForm;
