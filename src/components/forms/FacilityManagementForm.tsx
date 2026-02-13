// src/components/forms/FacilityManagementForm.tsx
'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { SearchableSelect, SelectOption } from '@/components/ui/SearchableSelect';
import { Button } from '@/components/ui/Button';
import { FacilityType, RwandaDistrictType, RWANDA_DISTRICTS } from '@/types';
import { createFacilitySchema } from '@/lib/schemas';
import { z } from 'zod';
import { zodErrorToFieldMap } from '@/lib/utils/zod';
import { ApiClientError } from '@/lib/utils/apiError';

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

  const setFieldError = (field: string, message?: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  };

  const validateFieldLive = (field: keyof FacilityFormData, value: unknown) => {
    const asString = String(value ?? '');
    if (field === 'name') {
      const parsed = z.string().trim().min(2, 'Facility name must be at least 2 characters.').safeParse(asString);
      setFieldError('name', parsed.success ? undefined : parsed.error.issues[0]?.message);
      return;
    }
    if (field === 'code') {
      const parsed = z.string().trim().min(2, 'Facility code must be at least 2 characters.').safeParse(asString);
      if (!parsed.success) {
        setFieldError('code', parsed.error.issues[0]?.message);
      } else if (!/^[A-Z0-9]{3,10}$/.test(asString)) {
        setFieldError('code', 'Code must be 3-10 uppercase letters/numbers');
      } else {
        setFieldError('code');
      }
      return;
    }
    if (field === 'contactPerson') {
      const parsed = z.string().trim().min(2, 'Contact person must be at least 2 characters.').safeParse(asString);
      setFieldError('contactPerson', parsed.success ? undefined : parsed.error.issues[0]?.message);
      return;
    }
    if (field === 'phone') {
      const parsed = z.string().trim().min(10, 'Phone number must be at least 10 digits.').safeParse(asString);
      if (!parsed.success) {
        setFieldError('phone', parsed.error.issues[0]?.message);
      } else if (!/^(\+250|0)[0-9]{9}$/.test(asString.replace(/\s/g, ''))) {
        setFieldError('phone', 'Invalid Rwanda phone number format');
      } else {
        setFieldError('phone');
      }
      return;
    }
    if (field === 'email') {
      const parsed = z.string().trim().email('Enter a valid email address.').safeParse(asString);
      setFieldError('email', parsed.success ? undefined : parsed.error.issues[0]?.message);
      return;
    }
    if (field === 'district') {
      const parsed = z.string().trim().min(1, 'District is required.').safeParse(asString);
      setFieldError('district', parsed.success ? undefined : parsed.error.issues[0]?.message);
      return;
    }
    if (field === 'type') {
      const parsed = z.string().trim().min(1, 'Facility type is required.').safeParse(asString);
      setFieldError('type', parsed.success ? undefined : parsed.error.issues[0]?.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    if (type !== 'checkbox') {
      validateFieldLive(name as keyof FacilityFormData, val);
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
    try {
      createFacilitySchema.parse(formData);
      if (!/^(\+250|0)[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Invalid Rwanda phone number format';
      }
      if (!/^[A-Z0-9]{3,10}$/.test(formData.code)) {
        newErrors.code = 'Code must be 3-10 uppercase letters/numbers';
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        Object.assign(newErrors, zodErrorToFieldMap(error));
      }
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
      if (error instanceof ApiClientError && error.fieldErrors) {
        setErrors((prev) => ({ ...prev, ...error.fieldErrors }));
      }
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
            onChange={(value) => {
              const nextValue = value as FacilityType || 'health_center';
              setFormData(prev => ({ ...prev, type: nextValue }));
              validateFieldLive('type', nextValue);
            }}
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
            onChange={(value) => {
              const nextValue = value as RwandaDistrictType || 'gasabo';
              setFormData(prev => ({ ...prev, district: nextValue }));
              validateFieldLive('district', nextValue);
            }}
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
