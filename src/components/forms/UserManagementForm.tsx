// src/components/forms/UserManagementForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { SearchableSelect, SelectOption } from '@/components/ui/SearchableSelect';
import { Button } from '@/components/ui/Button';
import { USER_ROLES, UserRole, RwandaDistrictType, RWANDA_DISTRICTS } from '@/types';

interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  facilityId?: string;
  district?: RwandaDistrictType;
  password: string;
  confirmPassword: string;
  workerId?: string;
}

interface UserManagementFormProps {
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  initialData?: Partial<UserFormData>;
  isEditing?: boolean;
}

const UserManagementForm: React.FC<UserManagementFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || USER_ROLES.HEALTH_WORKER,
    facilityId: initialData?.facilityId || '',
    district: initialData?.district || undefined,
    password: '',
    confirmPassword: '',
    workerId: initialData?.workerId || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [facilities, setFacilities] = useState<any[]>([]);

  useEffect(() => {
    const loadFacilities = async () => {
      try {
        const response = await fetch('/api/facilities');
        const data = await response.json();
        setFacilities(data.success ? data.data : []);
      } catch (error) {
        console.error('Error loading facilities:', error);
      }
    };
    loadFacilities();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const searchFacilities = async (query: string): Promise<SelectOption[]> => {
    if (!query.trim()) {
      return facilities.map((f: any) => ({
        value: f.code,
        label: `${f.name} - ${f.district}`
      }));
    }
    
    return facilities
      .filter((f: any) => 
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.code.toLowerCase().includes(query.toLowerCase()) ||
        f.district.toLowerCase().includes(query.toLowerCase())
      )
      .map((f: any) => ({
        value: f.code,
        label: `${f.name} - ${f.district}`
      }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if ((formData.role === USER_ROLES.DISTRICT_OFFICER || formData.role === USER_ROLES.HEALTH_WORKER || formData.role === USER_ROLES.LAB_TECHNICIAN) && !formData.district) {
      newErrors.district = 'District is required for this role';
    }

    // Only require facility for health workers and lab technicians
    if ((formData.role === USER_ROLES.HEALTH_WORKER || formData.role === USER_ROLES.LAB_TECHNICIAN) && !formData.facilityId) {
      newErrors.facilityId = 'Facility is required for this role';
    }

    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
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
      // Prepare submit data without workerId initially
      const submitData: any = { ...formData };
      
      // Only include workerId if it exists (for editing existing users)
      if (submitData.workerId) {
        // Don't send workerId from form data as API will generate it for new users
        delete submitData.workerId;
      }
      
      if (isEditing) {
        delete submitData.password;
        delete submitData.confirmPassword;
      }
      
      await onSubmit(submitData);
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
          <Input
            label="Full Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter full name"
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
            placeholder="Enter email address"
            disabled={isLoading}
          />
        </div>

        <div>
          <SearchableSelect
            label="Role *"
            value={formData.role}
            onChange={(value) => setFormData(prev => ({ ...prev, role: value as UserRole || USER_ROLES.HEALTH_WORKER }))}
            error={errors.role}
            options={[
              { value: USER_ROLES.HEALTH_WORKER, label: 'Health Worker' },
              { value: USER_ROLES.LAB_TECHNICIAN, label: 'Lab Technician' },
              { value: USER_ROLES.DISTRICT_OFFICER, label: 'District Officer' },
              { value: USER_ROLES.NATIONAL_OFFICER, label: 'National Officer' },
              { value: USER_ROLES.ADMIN, label: 'System Administrator' },
            ]}
            placeholder="Select a role"
            disabled={isLoading}
          />
        </div>

        {(formData.role === USER_ROLES.HEALTH_WORKER || formData.role === USER_ROLES.LAB_TECHNICIAN) && (
          <div>
            <SearchableSelect
              label="Facility *"
              value={formData.facilityId}
              onChange={(value) => setFormData(prev => ({ ...prev, facilityId: value || undefined }))}
              options={facilities.map((f: any) => ({
                value: f.code,
                label: `${f.name} - ${f.district}`
              }))}
              error={errors.facilityId}
              placeholder="Select a facility..."
              isClearable
              disabled={isLoading}
            />
          </div>
        )}

        {(formData.role === USER_ROLES.DISTRICT_OFFICER || formData.role === USER_ROLES.HEALTH_WORKER || formData.role === USER_ROLES.LAB_TECHNICIAN) && (
          <div>
            <SearchableSelect
              label="District *"
              value={formData.district}
              onChange={(value) => setFormData(prev => ({ ...prev, district: value as RwandaDistrictType || undefined }))}
              options={Object.entries(RWANDA_DISTRICTS).map(([key, value]) => ({
                value: value,
                label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
              }))}
              error={errors.district}
              placeholder="Select a district..."
              isClearable
              disabled={isLoading}
            />
          </div>
        )}

        {!isEditing && (
          <>
            <div>
              <Input
                label="Password *"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Enter password (min 8 characters)"
                disabled={isLoading}
              />
            </div>

            <div>
              <Input
                label="Confirm Password *"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Confirm password"
                disabled={isLoading}
              />
            </div>
          </>
        )}
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
          {isEditing ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

export default UserManagementForm;