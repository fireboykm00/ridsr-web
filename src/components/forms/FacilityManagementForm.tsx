// src/components/forms/FacilityManagementForm.tsx
'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { SearchableSelect, SelectOption } from '@/components/ui/SearchableSelect';
import { Button } from '@/components/ui/Button';
import { FacilityType, RwandaDistrictType, RWANDA_DISTRICTS } from '@/types';

interface FacilityFormData {
  name: string;
  code: string;
  type: FacilityType;
  district: RwandaDistrictType;
  contactPerson: string;
  phone: string;
  email: string;
  isActive: boolean;
}

interface FacilityManagementFormProps {
  onSubmit: (data: FacilityFormData) => void;
  onCancel: () => void;
  initialData?: Partial<FacilityFormData>;
  isEditing?: boolean;
}

const FacilityManagementForm: React.FC<FacilityManagementFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<FacilityFormData>({
    name: initialData?.name || '',
    code: initialData?.code || '',
    type: initialData?.type || 'health_center',
    district: initialData?.district || 'gasabo',
    contactPerson: initialData?.contactPerson || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    isActive: initialData?.isActive ?? true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
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

    if (!formData.name.trim()) {
      newErrors.name = 'Facility name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Facility code is required';
    } else if (!/^[A-Z0-9]{3,10}$/.test(formData.code)) {
      newErrors.code = 'Code must be 3-10 uppercase letters/numbers';
    }

    if (!formData.type) {
      newErrors.type = 'Facility type is required';
    }

    if (!formData.district) {
      newErrors.district = 'District is required';
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+250|0)[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid Rwanda phone number format';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label="Facility Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter facility name"
            disabled={isLoading}
          />
        </div>

        <div>
          <Input
            label="Facility Code *"
            name="code"
            value={formData.code}
            onChange={handleChange}
            error={errors.code}
            placeholder="e.g., HC001, HOSP01"
            disabled={isLoading}
          />
        </div>

        <div>
          <SearchableSelect
            label="Facility Type *"
            value={formData.type}
            onChange={(value) => setFormData(prev => ({ ...prev, type: value as FacilityType || 'health_center' }))}
            error={errors.type}
            options={[
              { value: 'health_center', label: 'Health Center' },
              { value: 'hospital', label: 'Hospital' },
              { value: 'clinic', label: 'Clinic' },
              { value: 'dispensary', label: 'Dispensary' },
              { value: 'medical_center', label: 'Medical Center' },
            ]}
            placeholder="Select facility type"
            disabled={isLoading}
          />
        </div>

        <div>
          <SearchableSelect
            label="District *"
            value={formData.district}
            onChange={(value) => setFormData(prev => ({ ...prev, district: value as RwandaDistrictType || 'gasabo' }))}
            onSearch={searchDistricts}
            error={errors.district}
            placeholder="Search districts..."
            disabled={isLoading}
          />
        </div>

        <div>
          <Input
            label="Contact Person *"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            error={errors.contactPerson}
            placeholder="Enter contact person name"
            disabled={isLoading}
          />
        </div>

        <div>
          <Input
            label="Phone Number *"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="+250 788 123 456"
            disabled={isLoading}
          />
        </div>

        <div>
          <Input
            label="Email *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="facility@example.com"
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center pt-6">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            disabled={isLoading}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Active Facility
          </label>
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
          {isEditing ? 'Update Facility' : 'Create Facility'}
        </Button>
      </div>
    </form>
  );
};

export default FacilityManagementForm;