'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useToastHelpers } from '@/components/ui/Toast';
import { USER_ROLES, User, Facility, UserRole, RwandaDistrictType, RWANDA_DISTRICTS } from '@/types';
import { userService } from '@/lib/services/userService';
import { facilityService } from '@/lib/services/facilityService';
import { createUserSchema, updateUserSchema } from '@/lib/schemas';
import { z } from 'zod';
import { zodErrorToFieldMap } from '@/lib/utils/zod';
import { ApiClientError } from '@/lib/utils/apiError';

interface UserFormData {
  nationalId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  workerId?: string;
  facilityId?: string;
  district?: RwandaDistrictType;
  password?: string;
}

interface UserManagementFormProps {
  user?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const liveFieldValidators = {
  name: z.string().trim().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().trim().email('Enter a valid email address.'),
  phone: z.string().trim().min(10, 'Phone number must be at least 10 digits.'),
  nationalId: z.string().trim().min(5, 'National ID must be at least 5 characters.').max(20, 'National ID must be at most 20 characters.'),
  password: z.string().trim().min(6, 'Password must be at least 6 characters.'),
} as const;
const FACILITY_REQUIRED_ROLES: UserRole[] = [USER_ROLES.HEALTH_WORKER, USER_ROLES.LAB_TECHNICIAN];
const DISTRICT_REQUIRED_ROLES: UserRole[] = [USER_ROLES.DISTRICT_OFFICER, USER_ROLES.HEALTH_WORKER, USER_ROLES.LAB_TECHNICIAN];

export function UserManagementForm({ user, onSuccess, onCancel }: UserManagementFormProps) {
  const { error: showError, success: showSuccess } = useToastHelpers();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [formData, setFormData] = useState<UserFormData>({
    nationalId: user?.nationalId || '',
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    workerId: user?.workerId || '',
    role: user?.role || USER_ROLES.HEALTH_WORKER,
    facilityId: user?.facilityId || '',
    district: user?.district || undefined,
    password: ''
  });

  const isEditing = !!user;

  const setFieldError = (field: string, message?: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  };

  const validateLiveField = (field: keyof typeof liveFieldValidators, value: string) => {
    if (field === 'password' && isEditing && !value.trim()) {
      setFieldError('password');
      return;
    }
    const parsed = liveFieldValidators[field].safeParse(value);
    setFieldError(field, parsed.success ? undefined : parsed.error.issues[0]?.message);
  };

  useEffect(() => {
    const loadFacilities = async () => {
      try {
        const facilitiesData = await facilityService.getAllFacilities();
        setFacilities(facilitiesData);
      } catch (error) {
        console.error('Error loading facilities:', error);
        showError('Failed to load facilities');
      }
    };

    loadFacilities();
  }, [showError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      setErrors({});

      if (isEditing) {
        updateUserSchema.parse({
          workerId: formData.workerId || undefined,
          nationalId: formData.nationalId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          facilityId: formData.facilityId || undefined,
          district: formData.district,
        });
      } else {
        createUserSchema.parse({
          workerId: formData.workerId || undefined,
          nationalId: formData.nationalId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          facilityId: formData.facilityId || undefined,
          district: formData.district,
        });
      }

      // Facility is only required for health workers and lab technicians
      const isFacilityRequired = FACILITY_REQUIRED_ROLES.includes(formData.role);
      if (isFacilityRequired && !formData.facilityId) {
        setFieldError('facilityId', 'Facility is required for this role');
        showError('Facility is required for this role');
        return;
      }

      // District is required for district officers, health workers, and lab technicians
      const isDistrictRequired = DISTRICT_REQUIRED_ROLES.includes(formData.role);
      if (isDistrictRequired && !formData.district) {
        setFieldError('district', 'District is required for this role');
        showError('District is required for this role');
        return;
      }

      if (!isEditing && !formData.password) {
        setErrors((prev) => ({ ...prev, password: 'Password is required for new users' }));
        showError('Password is required for new users');
        return;
      }

      if (isEditing && user) {
        const updateData: {
          workerId?: string;
          nationalId: string;
          name: string;
          email: string;
          phone: string;
          role: UserRole;
          district: RwandaDistrictType | undefined;
          facilityId?: string;
          password?: string;
        } = {
          nationalId: formData.nationalId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          district: formData.district
        };

        if (formData.workerId?.trim()) {
          updateData.workerId = formData.workerId.trim();
        }

        // Only include facilityId if it has a value
        if (formData.facilityId) {
          updateData.facilityId = formData.facilityId;
        }

        if (formData.password) {
          updateData.password = formData.password;
        }

        await userService.updateUser(user.id, updateData);
        showSuccess('User updated successfully');
      } else {
        const createData: {
          workerId?: string;
          nationalId: string;
          name: string;
          email: string;
          phone: string;
          role: UserRole;
          district: RwandaDistrictType | undefined;
          password: string;
          facilityId?: string;
        } = {
          nationalId: formData.nationalId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          district: formData.district,
          password: formData.password!
        };

        if (formData.workerId?.trim()) {
          createData.workerId = formData.workerId.trim();
        }

        // Only include facilityId if it has a value
        if (formData.facilityId) {
          createData.facilityId = formData.facilityId;
        }

        await userService.createUser(createData);
        showSuccess('User created successfully');
      }

      onSuccess();
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        setErrors(zodErrorToFieldMap(error));
      } else if (error instanceof ApiClientError && error.fieldErrors) {
        setErrors(error.fieldErrors);
      }
      const message = error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'create'} user`;
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: USER_ROLES.HEALTH_WORKER, label: 'Health Worker' },
    { value: USER_ROLES.LAB_TECHNICIAN, label: 'Lab Technician' },
    { value: USER_ROLES.DISTRICT_OFFICER, label: 'District Officer' },
    { value: USER_ROLES.NATIONAL_OFFICER, label: 'National Officer' },
    { value: USER_ROLES.ADMIN, label: 'Administrator' }
  ];

  const facilityOptions = facilities.map(facility => ({
    value: facility.code,
    label: `${facility.name} - ${facility.district}`
  }));

  const districtOptions = Object.entries(RWANDA_DISTRICTS).map(([key, value]) => ({
    value: value,
    label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        value={formData.name}
        onChange={(e) => {
          const value = e.target.value;
          setFormData({ ...formData, name: value });
          validateLiveField('name', value);
        }}
        error={errors.name}
        required
        disabled={loading}
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => {
          const value = e.target.value;
          setFormData({ ...formData, email: value });
          validateLiveField('email', value);
        }}
        error={errors.email}
        required
        disabled={loading}
      />

      <Input
        label="Phone"
        value={formData.phone}
        onChange={(e) => {
          const value = e.target.value;
          setFormData({ ...formData, phone: value });
          validateLiveField('phone', value);
        }}
        error={errors.phone}
        required
        disabled={loading}
        placeholder="e.g. +2507XXXXXXXX"
      />

      <Input
        label="National ID"
        value={formData.nationalId}
        onChange={(e) => {
          const value = e.target.value;
          setFormData({ ...formData, nationalId: value });
          validateLiveField('nationalId', value);
        }}
        error={errors.nationalId}
        required
        disabled={loading}
      />

      <Input
        label="Worker ID (optional)"
        value={formData.workerId || ''}
        onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
        error={errors.workerId}
        disabled={loading}
        placeholder="Auto-generated if blank"
      />

      <SearchableSelect
        label="Role"
        value={formData.role}
        onChange={(value) => {
          setFormData({ ...formData, role: value as UserRole });
          setFieldError('role', value ? undefined : 'Role is required.');
        }}
        options={roleOptions}
        error={errors.role}
        required
        disabled={loading}
      />

      {DISTRICT_REQUIRED_ROLES.includes(formData.role) && (
        <SearchableSelect
          label="District *"
          value={formData.district}
          onChange={(value) => {
            setFormData({ ...formData, district: value as RwandaDistrictType });
            setFieldError('district', value ? undefined : 'District is required for this role');
          }}
          options={districtOptions}
          error={errors.district}
          required
          disabled={loading}
          placeholder="Select a district..."
        />
      )}

      {FACILITY_REQUIRED_ROLES.includes(formData.role) && (
        <SearchableSelect
          label="Facility *"
          value={formData.facilityId}
          onChange={(value) => {
            setFormData({ ...formData, facilityId: value || '' });
            setFieldError('facilityId', value ? undefined : 'Facility is required for this role');
          }}
          options={facilityOptions}
          error={errors.facilityId}
          required
          disabled={loading}
          placeholder="Select a facility..."
        />
      )}

      <PasswordInput
        label={isEditing ? "New Password (leave blank to keep current)" : "Password"}
        value={formData.password}
        onChange={(e) => {
          const value = e.target.value;
          setFormData({ ...formData, password: value });
          validateLiveField('password', value);
        }}
        error={errors.password}
        required={!isEditing}
        disabled={loading}
      />

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          fullWidth
          isLoading={loading}
          disabled={loading}
        >
          {isEditing ? 'Update User' : 'Create User'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
