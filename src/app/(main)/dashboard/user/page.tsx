'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Modal } from '@/components/ui/Modal';
import { useToastHelpers } from '@/components/ui/Toast';
import { useDebounce } from '@/hooks/useDebounce';
import { UserGroupIcon, PlusIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { USER_ROLES, User, Facility, RWANDA_DISTRICTS } from '@/types';
import { userService } from '@/lib/services/userService';
import { facilityService } from '@/lib/services/facilityService';
import { UserManagementForm } from '@/features/users/components/UserManagementForm';

interface UserFilters {
  role: string;
  facility: string;
  district: string;
  status: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const { error: showError, success: showSuccess } = useToastHelpers();

  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<UserFilters>({
    role: '',
    facility: '',
    district: '',
    status: 'active'
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Check authorization
  const canManageUsers = session?.user?.role === USER_ROLES.ADMIN ||
    session?.user?.role === USER_ROLES.NATIONAL_OFFICER ||
    session?.user?.role === USER_ROLES.DISTRICT_OFFICER;

  useEffect(() => {
    const loadData = async () => {
      if (status === 'authenticated' && session) {
        if (!canManageUsers) {
          window.location.href = '/dashboard';
          return;
        }

        try {
          let usersData, facilitiesData;

          // District officers only see their district
          if (session.user?.role === USER_ROLES.DISTRICT_OFFICER && session.user.district) {
            [usersData, facilitiesData] = await Promise.all([
              userService.getUsersByDistrict(session.user.district),
              facilityService.getFacilitiesByDistrict(session.user.district)
            ]);
          } else {
            // Admin and National officers see all
            [usersData, facilitiesData] = await Promise.all([
              userService.getAllUsers(),
              facilityService.getAllFacilities()
            ]);


          }

          setUsers(usersData);
          setFacilities(facilitiesData);
        } catch (error) {
          console.error('Error loading data:', error);
          showError('Failed to load data');
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [status, session, showError, canManageUsers]);

  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch = !debouncedSearchTerm ||
      user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (user.workerId && user.workerId.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
      (user.nationalId && user.nationalId.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
      (user.phone && user.phone.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));

    const matchesRole = !filters.role || user.role === filters.role;
    const matchesFacility = !filters.facility || user.facilityId === filters.facility;
    const matchesDistrict = !filters.district || user.district === filters.district;
    const matchesStatus = filters.status === 'all' ||
      (filters.status === 'active' && user.isActive) ||
      (filters.status === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesFacility && matchesDistrict && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleUserSuccess = async () => {
    setShowModal(false);
    setEditingUser(null);

    try {
      const updatedUsers = await userService.getAllUsers();
      setUsers(updatedUsers);
    } catch {
      showError('Failed to reload users');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDeactivateUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const action = user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await userService.updateUser(userId, { isActive: !user.isActive });
      showSuccess(`User ${action}d successfully`);

      const updatedUsers = await userService.getAllUsers();
      setUsers(updatedUsers);
    } catch {
      showError(`Failed to ${action} user`);
    }
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      facility: '',
      district: '',
      status: 'active'
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: USER_ROLES.HEALTH_WORKER, label: 'Health Worker' },
    { value: USER_ROLES.LAB_TECHNICIAN, label: 'Lab Technician' },
    { value: USER_ROLES.DISTRICT_OFFICER, label: 'District Officer' },
    { value: USER_ROLES.NATIONAL_OFFICER, label: 'National Officer' },
    { value: USER_ROLES.ADMIN, label: 'Administrator' }
  ];

  const facilityOptions = [
    { value: '', label: 'All Facilities' },
    ...facilities.map(facility => ({
      value: facility.code,
      label: `${facility.name} - ${facility.district}`
    }))
  ];

  const districtOptions = [
    { value: '', label: 'All Districts' },
    ...Object.entries(RWANDA_DISTRICTS).map(([key, value]) => ({
      value: value,
      label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
    }))
  ];

  const statusOptions = [
    { value: 'active', label: 'Active Only' },
    { value: 'inactive', label: 'Inactive Only' },
    { value: 'all', label: 'All Users' }
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!session || !canManageUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only administrators, national officers, and district officers can manage users</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="h-6 w-6 text-blue-700" />
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          </div>
          <Button
            onClick={() => {
              setEditingUser(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add User
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Search & Filters</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <XMarkIcon className="h-4 w-4" />
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Input
                placeholder="Search by name, email, phone, worker ID, or national ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
              />

              <SearchableSelect
                placeholder="Filter by role"
                value={filters.role}
                onChange={(value) => setFilters({ ...filters, role: value || '' })}
                options={roleOptions}
              />

              <SearchableSelect
                placeholder="Filter by facility"
                value={filters.facility}
                onChange={(value) => setFilters({ ...filters, facility: value || '' })}
                options={facilityOptions}
              />

              <SearchableSelect
                placeholder="Filter by district"
                value={filters.district}
                onChange={(value) => setFilters({ ...filters, district: value || '' })}
                options={districtOptions}
              />

              <SearchableSelect
                placeholder="Filter by status"
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value || '' })}
                options={statusOptions}
              />
            </div>

            <div className="text-sm text-gray-600">
              Showing {paginatedUsers.length} of {filteredUsers.length} users
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Worker ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">National ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Facility</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">District</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => {
                  const facility = facilities.find(f => f.id === user.facilityId);
                  return (
                    <tr key={user.id + user.workerId} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{user.name}</td>
                      <td className="py-3 px-4 text-gray-900">{user.workerId || '-'}</td>
                      <td className="py-3 px-4 text-gray-900">{user.nationalId || '-'}</td>
                      <td className="py-3 px-4 text-gray-900">{user.email}</td>
                      <td className="py-3 px-4 text-gray-900">{user.phone || '-'}</td>
                      <td className="py-3 px-4 text-gray-900 capitalize">
                        {user.role.replace(/_/g, ' ').toLowerCase()}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {facility?.name || user.facilityId || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-900 capitalize">
                        {user.district || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit user"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeactivateUser(user.id)}
                            className={`p-2 rounded ${user.isActive
                              ? 'text-orange-600 hover:bg-orange-50'
                              : 'text-green-600 hover:bg-green-50'
                              }`}
                            title={user.isActive ? 'Deactivate user' : 'Activate user'}
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* User Management Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingUser(null);
          }}
          title={editingUser ? 'Edit User' : 'Add New User'}
        >
          <UserManagementForm
            user={editingUser}
            onSuccess={handleUserSuccess}
            onCancel={() => {
              setShowModal(false);
              setEditingUser(null);
            }}
          />
        </Modal>
      </div>
    </div>
  );
}
