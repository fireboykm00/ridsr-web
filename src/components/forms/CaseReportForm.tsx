// src/components/forms/CaseReportForm.tsx
'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { useSession } from 'next-auth/react';

interface Symptom {
  name: string;
  present: boolean;
}

interface CaseFormData {
  patientId: string;
  diseaseCode: string;
  onsetDate: string;
  symptoms: string[];
  additionalNotes: string;
  isPregnant: boolean;
  age: number;
  gender: string;
}

interface CaseReportFormProps {
  onSubmit: (data: CaseFormData) => void;
  onCancel: () => void;
  initialData?: CaseFormData;
}

const DISEASE_CODES = [
  { code: 'CHOLERA', name: 'Cholera' },
  { code: 'MAL01', name: 'Malaria' },
  { code: 'SARI', name: 'Severe Acute Respiratory Illness' },
  { code: 'AFP', name: 'Acute Flaccid Paralysis' },
  { code: 'YELLOW_FEVER', name: 'Yellow Fever' },
  { code: 'RUBELLA', name: 'Rubella' },
  { code: 'MEASLES', name: 'Measles' },
  { code: 'PLAGUE', name: 'Plague' },
  { code: 'RABIES', name: 'Rabies' },
  { code: 'EBOLA', name: 'Ebola Virus Disease' },
  { code: 'MONKEYPOX', name: 'Monkeypox' },
];

const COMMON_SYMPTOMS = [
  'fever',
  'cough',
  'difficulty breathing',
  'diarrhea',
  'vomiting',
  'headache',
  'muscle pain',
  'fatigue',
  'rash',
  'jaundice',
  'bleeding',
  'convulsions',
  'paralysis',
  'sore throat',
  'abdominal pain',
];

const CaseReportForm: React.FC<CaseReportFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<CaseFormData>({
    patientId: initialData?.patientId || '',
    diseaseCode: initialData?.diseaseCode || '',
    onsetDate: initialData?.onsetDate || new Date().toISOString().split('T')[0],
    symptoms: initialData?.symptoms || [],
    additionalNotes: initialData?.additionalNotes || '',
    isPregnant: initialData?.isPregnant || false,
    age: initialData?.age || 0,
    gender: initialData?.gender || '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSymptomChange = (symptom: string) => {
    setFormData(prev => {
      if (prev.symptoms.includes(symptom)) {
        return {
          ...prev,
          symptoms: prev.symptoms.filter(s => s !== symptom)
        };
      } else {
        return {
          ...prev,
          symptoms: [...prev.symptoms, symptom]
        };
      }
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId.trim()) {
      newErrors.patientId = 'Patient ID is required';
    }

    if (!formData.diseaseCode) {
      newErrors.diseaseCode = 'Disease code is required';
    }

    if (!formData.onsetDate) {
      newErrors.onsetDate = 'Onset date is required';
    }

    if (formData.symptoms.length === 0) {
      newErrors.symptoms = 'At least one symptom must be selected';
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
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Note:</span> This case will be automatically associated with your facility: {session?.user?.facilityId}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Patient ID *"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            error={errors.patientId}
            placeholder="Enter patient ID"
          />
        </div>
        
        <div>
          <Select
            label="Disease Code *"
            name="diseaseCode"
            value={formData.diseaseCode}
            onChange={(value) => setFormData(prev => ({ ...prev, diseaseCode: value }))}
            error={errors.diseaseCode}
          >
            <option value="">Select a disease</option>
            {DISEASE_CODES.map(disease => (
              <option key={disease.code} value={disease.code}>
                {disease.name} ({disease.code})
              </option>
            ))}
          </Select>
        </div>
        
        <div>
          <Input
            label="Onset Date *"
            name="onsetDate"
            type="date"
            value={formData.onsetDate}
            onChange={handleChange}
            error={errors.onsetDate}
          />
        </div>
        
        <div>
          <Input
            label="Age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            placeholder="Patient age"
          />
        </div>
        
        <div>
          <Select
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
        </div>
        
        <div className="flex items-center pt-6">
          <Checkbox
            id="isPregnant"
            name="isPregnant"
            checked={formData.isPregnant}
            onChange={(checked) => setFormData(prev => ({ ...prev, isPregnant: checked }))}
          />
          <label htmlFor="isPregnant" className="ml-2 block text-sm text-gray-900">
            Patient is pregnant
          </label>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Symptoms * {errors.symptoms && <span className="text-red-600">{errors.symptoms}</span>}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {COMMON_SYMPTOMS.map(symptom => (
            <div key={symptom} className="flex items-center">
              <Checkbox
                id={symptom}
                checked={formData.symptoms.includes(symptom)}
                onChange={() => handleSymptomChange(symptom)}
              />
              <label htmlFor={symptom} className="ml-2 block text-sm text-gray-700 capitalize">
                {symptom.replace('_', ' ')}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <Input
          label="Additional Notes"
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={handleChange}
          placeholder="Any additional observations or notes"
          as="textarea"
          rows={4}
        />
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
          Submit Case Report
        </Button>
      </div>
    </form>
  );
};

export default CaseReportForm;