// src/features/users/components/UserCard.tsx
'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { USER_ROLES } from '@/types';

interface User {
  id: string;
  workerId: string;
  name: string;
  email: string;
  role: string;
  facilityId: string;
  districtId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onView: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete, onView }) => {
  // Format role for display
  const getRoleLabel = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'System Administrator';
      case USER_ROLES.DISTRICT_OFFICER:
        return 'District Officer';
      case USER_ROLES.HEALTH_WORKER:
        return 'Health Worker';
      case USER_ROLES.LAB_TECHNICIAN:
        return 'Lab Technician';
      case USER_ROLES.NATIONAL_OFFICER:
        return 'National Officer';
      default:
        return role;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
              <p className="text-gray-600">{user.workerId} • {user.email}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Role</p>
              <p className="font-medium">{getRoleLabel(user.role)}</p>
            </div>
            <div>
              <p className="text-gray-500">Facility</p>
              <p className="font-medium">{user.facilityId}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className={`font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Created</p>
              <p className="font-medium">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onView(user)}
          >
            View
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(user)}
          >
            Edit
          </Button>
          <Button
            variant="tertiary"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={() => onDelete(user.id)}
          >
            {user.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UserCard;