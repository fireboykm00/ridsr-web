// src/components/forms/UserManagementForm.tsx
'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { USER_ROLES } from '@/types';

interface UserFormData {
  workerId: string;
  name: string;
  email: string;
  role: string;
  facilityId: string;
  districtId?: string;
  password: string;
  confirmPassword: string;
}

interface UserManagementFormProps {
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  initialData?: UserFormData;
  isEditing?: boolean;
}

const UserManagementForm: React.FC<UserManagementFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    workerId: initialData?.workerId || '',
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || USER_ROLES.HEALTH_WORKER,
    facilityId: initialData?.facilityId || '',
    districtId: initialData?.districtId || '',
    password: '',
    confirmPassword: ''
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.workerId.trim()) {
      newErrors.workerId = 'Worker ID is required';
    }

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

    if (!formData.facilityId.trim()) {
      newErrors.facilityId = 'Facility ID is required';
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'Password is required';
    }

    if (!isEditing && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
        <div>
          <Input
            label="Worker ID *"
            name="workerId"
            value={formData.workerId}
            onChange={handleChange}
            error={errors.workerId}
            placeholder="Enter worker ID (e.g., HW001)"
          />
        </div>

        <div>
          <Input
            label="Full Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter full name"
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
          />
        </div>

        <div>
          <Select
            label="Role *"
            name="role"
            value={formData.role}
            onChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
            error={errors.role}
          >
            <option value="">Select a role</option>
            <option value={USER_ROLES.HEALTH_WORKER}>Health Worker</option>
            <option value={USER_ROLES.LAB_TECHNICIAN}>Lab Technician</option>
            <option value={USER_ROLES.DISTRICT_OFFICER}>District Officer</option>
            <option value={USER_ROLES.NATIONAL_OFFICER}>National Officer</option>
            <option value={USER_ROLES.ADMIN}>System Administrator</option>
          </Select>
        </div>

        <div>
          <Input
            label="Facility ID *"
            name="facilityId"
            value={formData.facilityId}
            onChange={handleChange}
            error={errors.facilityId}
            placeholder="Enter facility ID"
          />
        </div>

        <div>
          <Input
            label="District ID"
            name="districtId"
            value={formData.districtId}
            onChange={handleChange}
            placeholder="Enter district ID (optional)"
          />
        </div>

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
                placeholder="Enter password"
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