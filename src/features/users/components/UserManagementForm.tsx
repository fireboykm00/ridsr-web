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

interface UserFormData {
  name: string;
  email: string;
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

export function UserManagementForm({ user, onSuccess, onCancel }: UserManagementFormProps) {
  const { error: showError, success: showSuccess } = useToastHelpers();
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [formData, setFormData] = useState<UserFormData>({
    name: user?.name || '',
    email: user?.email || '',
    workerId: user?.workerId || '',
    role: user?.role || USER_ROLES.HEALTH_WORKER,
    facilityId: user?.facilityId || '',
    district: user?.district || undefined,
    password: ''
  });

  const isEditing = !!user;

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
      if (!formData.name || !formData.email) {
        showError('Please fill in required fields (Name, Email)');
        return;
      }

      // Facility is only required for health workers and lab technicians
      const isFacilityRequired = [USER_ROLES.HEALTH_WORKER, USER_ROLES.LAB_TECHNICIAN].includes(formData.role as any);
      if (isFacilityRequired && !formData.facilityId) {
        showError('Facility is required for this role');
        return;
      }

      // District is required for district officers, health workers, and lab technicians
      const isDistrictRequired = [USER_ROLES.DISTRICT_OFFICER, USER_ROLES.HEALTH_WORKER, USER_ROLES.LAB_TECHNICIAN].includes(formData.role as any);
      if (isDistrictRequired && !formData.district) {
        showError('District is required for this role');
        return;
      }

      if (!isEditing && !formData.password) {
        showError('Password is required for new users');
        return;
      }

      if (isEditing && user) {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          district: formData.district
        };

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
        const createData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          district: formData.district,
          password: formData.password!
        };

        // Only include facilityId if it has a value
        if (formData.facilityId) {
          createData.facilityId = formData.facilityId;
        }

        await userService.createUser(createData);
        showSuccess('User created successfully');
      }

      onSuccess();
    } catch (error: any) {
      showError(error.message || `Failed to ${isEditing ? 'update' : 'create'} user`);
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
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        disabled={loading}
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
        disabled={loading}
      />

      {isEditing && (
        <Input
          label="Worker ID"
          value={formData.workerId || ''}
          onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
          required
          disabled={loading}
          placeholder="e.g. HW-12345"
        />
      )}

      <SearchableSelect
        label="Role"
        value={formData.role}
        onChange={(value) => setFormData({ ...formData, role: value as UserRole })}
        options={roleOptions}
        required
        disabled={loading}
      />

      {[USER_ROLES.DISTRICT_OFFICER, USER_ROLES.HEALTH_WORKER, USER_ROLES.LAB_TECHNICIAN].includes(formData.role as any) && (
        <SearchableSelect
          label="District *"
          value={formData.district}
          onChange={(value) => setFormData({ ...formData, district: value as RwandaDistrictType })}
          options={districtOptions}
          required
          disabled={loading}
          placeholder="Select a district..."
        />
      )}

      {[USER_ROLES.HEALTH_WORKER, USER_ROLES.LAB_TECHNICIAN].includes(formData.role as any) && (
        <SearchableSelect
          label="Facility *"
          value={formData.facilityId}
          onChange={(value) => setFormData({ ...formData, facilityId: value })}
          options={facilityOptions}
          required
          disabled={loading}
          placeholder="Select a facility..."
        />
      )}

      <PasswordInput
        label={isEditing ? "New Password (leave blank to keep current)" : "Password"}
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required={!isEditing}
        disabled={loading}
      />

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          fullWidth
          loading={loading}
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