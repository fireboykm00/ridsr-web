// src/components/ui/UserSearch.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Input } from './Input';
import { SearchableSelect } from './SearchableSelect';
import { userService } from '@/lib/services/userService';
import { USER_ROLES } from '@/types';
import { User } from '@/lib/services/userService';

interface UserSearchProps {
  onUserSelect?: (user: User) => void;
  filters?: {
    role?: string;
    facility?: string;
    district?: string;
  };
  showFilters?: boolean;
}

const UserSearch = ({ onUserSelect, filters = {}, showFilters = true }: UserSearchProps) => {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState(filters.role || '');
  const [facilityFilter, setFacilityFilter] = useState(filters.facility || '');
  const [districtFilter, setDistrictFilter] = useState(filters.district || '');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Role options for the select dropdown
  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: USER_ROLES.ADMIN, label: 'Administrator' },
    { value: USER_ROLES.DISTRICT_OFFICER, label: 'District Officer' },
    { value: USER_ROLES.HEALTH_WORKER, label: 'Health Worker' },
    { value: USER_ROLES.LAB_TECHNICIAN, label: 'Lab Technician' },
    { value: USER_ROLES.NATIONAL_OFFICER, label: 'National Officer' },
  ];

  // Load users based on permissions
  useEffect(() => {
    const loadUsers = async () => {
      if (!session) return;

      setIsLoading(true);
      try {
        // Only admins can see all users
        if (session.user?.role === USER_ROLES.ADMIN) {
          const allUsers = await userService.getAllUsers();
          setUsers(allUsers);
        }
        // National officers can see all users
        else if (session.user?.role === USER_ROLES.NATIONAL_OFFICER) {
          const allUsers = await userService.getAllUsers();
          setUsers(allUsers);
        }
        // District officers can see users in their district
        else if (session.user?.role === USER_ROLES.DISTRICT_OFFICER && session.user.district) {
          const districtUsers = await userService.getUsersByDistrict(session.user.district);
          setUsers(districtUsers);
        }
        // Health workers and lab technicians can see users in their facility
        else if ((session.user?.role === USER_ROLES.HEALTH_WORKER || session.user?.role === USER_ROLES.LAB_TECHNICIAN) && session.user.facilityId) {
          const facilityUsers = await userService.getUsersByFacility(session.user.facilityId);
          setUsers(facilityUsers);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [session]);

  // Apply filters when any filter changes
  useEffect(() => {
    let result = [...users];

    // Apply search term filter
    if (searchTerm) {
      result = result.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter) {
      result = result.filter(user => user.role === roleFilter);
    }

    // Apply facility filter
    if (facilityFilter) {
      result = result.filter(user =>
        user.facilityId && user.facilityId.toLowerCase().includes(facilityFilter.toLowerCase())
      );
    }

    // Apply district filter
    if (districtFilter) {
      result = result.filter(user =>
        user.district && user.district.toLowerCase().includes(districtFilter.toLowerCase())
      );
    }

    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter, facilityFilter, districtFilter]);

  const handleUserSelect = (user: User) => {
    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Search Users"
            placeholder="Name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchableSelect
            label="Role"
            value={roleFilter}
            onChange={(value) => setRoleFilter(value)}
            options={roleOptions}
          />
          <Input
            label="Facility"
            placeholder="Facility name..."
            value={facilityFilter}
            onChange={(e) => setFacilityFilter(e.target.value)}
          />
          <Input
            label="District"
            placeholder="District name..."
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {users.length === 0 ? 'No users available' : 'No users match your search'}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-3 border border-border rounded-md hover:bg-muted cursor-pointer transition-colors"
                onClick={() => handleUserSelect(user)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-foreground text-sm">{user.name}</h4>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {user.role.replace('_', ' ')}
                    </span>
                    {user.facilityId && (
                      <p className="text-xs text-muted-foreground mt-1">{user.facilityId}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export { UserSearch };
