// src/features/users/components/UserList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import UserCard from './UserCard';
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

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onView: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterFacility, setFilterFacility] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Filter users based on search and filter criteria
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.workerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !filterRole || user.role === filterRole;
    const matchesFacility = !filterFacility || user.facilityId.toLowerCase().includes(filterFacility.toLowerCase());
    const matchesStatus = !filterStatus || user.isActive.toString() === filterStatus;

    return matchesSearch && matchesRole && matchesFacility && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <Button variant="primary">Add New User</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>

            <div className="space-y-4">
              <Input
                label="Search Users"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name, Worker ID, or Email"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Roles</option>
                  <option value={USER_ROLES.HEALTH_WORKER}>Health Worker</option>
                  <option value={USER_ROLES.LAB_TECHNICIAN}>Lab Technician</option>
                  <option value={USER_ROLES.DISTRICT_OFFICER}>District Officer</option>
                  <option value={USER_ROLES.NATIONAL_OFFICER}>National Officer</option>
                  <option value={USER_ROLES.ADMIN}>System Administrator</option>
                </select>
              </div>

              <Input
                label="Facility ID"
                value={filterFacility}
                onChange={(e) => setFilterFacility(e.target.value)}
                placeholder="Filter by facility"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <div className="space-y-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                />
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No users found matching your criteria.</p>
              </Card>
            )}
          </div>

          {filteredUsers.length > 0 && (
            <div className="mt-6 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a href="#" className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Previous
                </a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  2
                </a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  3
                </a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Next
                </a>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;