// src/components/forms/FacilityManagementForm.tsx
'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';

interface FacilityAddress {
  street: string;
  sector: string;
  district: string;
  province: string;
  country: string;
}

interface FacilityCoordinates {
  latitude: number;
  longitude: number;
}

interface FacilityFormData {
  name: string;
  code: string;
  type: string;
  districtId: string;
  provinceId: string;
  address: FacilityAddress;
  coordinates: FacilityCoordinates;
  isActive: boolean;
}

interface FacilityManagementFormProps {
  onSubmit: (data: FacilityFormData) => void;
  onCancel: () => void;
  initialData?: FacilityFormData;
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
    districtId: initialData?.districtId || '',
    provinceId: initialData?.provinceId || '',
    address: initialData?.address || {
      street: '',
      sector: '',
      district: '',
      province: '',
      country: 'Rwanda'
    },
    coordinates: initialData?.coordinates || {
      latitude: 0,
      longitude: 0
    },
    isActive: initialData?.isActive ?? true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddressChange = (field: keyof FacilityAddress, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[`address.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`address.${field}`];
        return newErrors;
      });
    }
  };

  const handleCoordinatesChange = (field: keyof FacilityCoordinates, value: string) => {
    setFormData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [field]: parseFloat(value) || 0
      }
    }));
    
    // Clear error when user starts typing
    if (errors[`coordinates.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`coordinates.${field}`];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Facility name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Facility code is required';
    }

    if (!formData.type) {
      newErrors.type = 'Facility type is required';
    }

    if (!formData.districtId.trim()) {
      newErrors.districtId = 'District ID is required';
    }

    if (!formData.provinceId.trim()) {
      newErrors.provinceId = 'Province ID is required';
    }

    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street address is required';
    }

    if (!formData.address.sector.trim()) {
      newErrors['address.sector'] = 'Sector is required';
    }

    if (!formData.address.district.trim()) {
      newErrors['address.district'] = 'District is required';
    }

    if (!formData.address.province.trim()) {
      newErrors['address.province'] = 'Province is required';
    }

    if (isNaN(formData.coordinates.latitude) || formData.coordinates.latitude === 0) {
      newErrors['coordinates.latitude'] = 'Valid latitude is required';
    }

    if (isNaN(formData.coordinates.longitude) || formData.coordinates.longitude === 0) {
      newErrors['coordinates.longitude'] = 'Valid longitude is required';
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label="Facility Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter facility name"
          />
        </div>
        
        <div>
          <Input
            label="Facility Code *"
            name="code"
            value={formData.code}
            onChange={handleChange}
            error={errors.code}
            placeholder="Enter unique facility code"
          />
        </div>
        
        <div>
          <SearchableSelect
            label="Facility Type *"
            name="type"
            value={formData.type}
            onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            error={errors.type}
          >
            <option value="">Select facility type</option>
            <option value="health_center">Health Center</option>
            <option value="hospital">Hospital</option>
            <option value="clinic">Clinic</option>
            <option value="dispensary">Dispensary</option>
            <option value="medical_center">Medical Center</option>
          </SearchableSelect>
        </div>
        
        <div>
          <Input
            label="District ID *"
            name="districtId"
            value={formData.districtId}
            onChange={handleChange}
            error={errors.districtId}
            placeholder="Enter district ID"
          />
        </div>
        
        <div>
          <Input
            label="Province ID *"
            name="provinceId"
            value={formData.provinceId}
            onChange={handleChange}
            error={errors.provinceId}
            placeholder="Enter province ID"
          />
        </div>
        
        <div>
          <Input
            label="Latitude *"
            name="latitude"
            type="number"
            value={formData.coordinates.latitude}
            onChange={(e) => handleCoordinatesChange('latitude', e.target.value)}
            error={errors['coordinates.latitude']}
            placeholder="Enter latitude (e.g., -1.949956)"
          />
        </div>
        
        <div>
          <Input
            label="Longitude *"
            name="longitude"
            type="number"
            value={formData.coordinates.longitude}
            onChange={(e) => handleCoordinatesChange('longitude', e.target.value)}
            error={errors['coordinates.longitude']}
            placeholder="Enter longitude (e.g., 30.058847)"
          />
        </div>
        
        <div className="md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
        </div>
        
        <div>
          <Input
            label="Street Address *"
            name="street"
            value={formData.address.street}
            onChange={(e) => handleAddressChange('street', e.target.value)}
            error={errors['address.street']}
            placeholder="Enter street address"
          />
        </div>
        
        <div>
          <Input
            label="Sector *"
            name="sector"
            value={formData.address.sector}
            onChange={(e) => handleAddressChange('sector', e.target.value)}
            error={errors['address.sector']}
            placeholder="Enter sector"
          />
        </div>
        
        <div>
          <Input
            label="District *"
            name="district"
            value={formData.address.district}
            onChange={(e) => handleAddressChange('district', e.target.value)}
            error={errors['address.district']}
            placeholder="Enter district"
          />
        </div>
        
        <div>
          <Input
            label="Province *"
            name="province"
            value={formData.address.province}
            onChange={(e) => handleAddressChange('province', e.target.value)}
            error={errors['address.province']}
            placeholder="Enter province"
          />
        </div>
        
        <div>
          <Input
            label="Country"
            name="country"
            value={formData.address.country}
            onChange={(e) => handleAddressChange('country', e.target.value)}
            placeholder="Enter country"
          />
        </div>
        
        <div className="flex items-center pt-6">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
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