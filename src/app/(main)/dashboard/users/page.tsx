'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Modal } from '@/components/ui/Modal';
import { useToastHelpers } from '@/components/ui/Toast';
import { UserGroupIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { USER_ROLES, User, Facility } from '@/types';
import { userService } from '@/lib/services/user-service';
import { facilityService } from '@/lib/services/facility-service';

interface UserFormData {
  name: string;
  email: string;
  workerId: string;
  role: string;
  facilityId: string;
  password: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const { error: showError, success: showSuccess } = useToastHelpers();
  const [users, setUsers] = useState<User[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    workerId: '',
    role: USER_ROLES.HEALTH_WORKER,
    facilityId: '',
    password: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (status === 'authenticated' && session) {
        // Check if user is admin
        if (session.user?.role !== USER_ROLES.ADMIN) {
          window.location.href = '/dashboard';
          return;
        }

        try {
          const [usersData, facilitiesData] = await Promise.all([
            userService.getAllUsers(),
            facilityService.getAllFacilities()
          ]);
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
  }, [status, session, showError]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.workerId || !formData.facilityId || !formData.password) {
      showError('Please fill in all fields');
      return;
    }

    try {
      await userService.createUser({
        name: formData.name,
        email: formData.email,
        workerId: formData.workerId,
        role: formData.role as any,
        facilityId: formData.facilityId,
        passwordHash: formData.password
      });

      showSuccess('User created successfully');
      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        workerId: '',
        role: USER_ROLES.HEALTH_WORKER,
        facilityId: '',
        password: ''
      });

      // Reload users
      const updatedUsers = await userService.getAllUsers();
      setUsers(updatedUsers);
    } catch (error) {
      showError('Failed to create user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await userService.deleteUser(userId);
      showSuccess('User deleted successfully');
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      showError('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.workerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== USER_ROLES.ADMIN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only administrators can manage users</p>
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
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add User
          </Button>
        </div>

        {/* Search */}
        <Card className="p-6 mb-6">
          <Input
            placeholder="Search by name, email, or worker ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
          />
        </Card>

        {/* Users Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Worker ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Facility</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{user.name}</td>
                    <td className="py-3 px-4 text-gray-900">{user.email}</td>
                    <td className="py-3 px-4 text-gray-900">{user.workerId}</td>
                    <td className="py-3 px-4 text-gray-900 capitalize">{user.role.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-gray-900">{user.facilityId}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add User Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New User">
          <form onSubmit={handleAddUser} className="space-y-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              label="Worker ID"
              value={formData.workerId}
              onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
              required
            />

            <SearchableSelect
              label="Role"
              value={formData.role}
              onChange={(value) => setFormData({ ...formData, role: value })}
              options={[
                { value: USER_ROLES.HEALTH_WORKER, label: 'Health Worker' },
                { value: USER_ROLES.LAB_TECHNICIAN, label: 'Lab Technician' },
                { value: USER_ROLES.DISTRICT_OFFICER, label: 'District Officer' },
                { value: USER_ROLES.NATIONAL_OFFICER, label: 'National Officer' },
              ]}
              required
            />

            <SearchableSelect
              label="Facility"
              value={formData.facilityId}
              onChange={(value) => setFormData({ ...formData, facilityId: value })}
              options={facilities.map(f => ({ value: f.id, label: f.name }))}
              required
            />

            <PasswordInput
              label="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" fullWidth>
                Create User
              </Button>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
