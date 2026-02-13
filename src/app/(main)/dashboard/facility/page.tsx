'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToastHelpers } from '@/components/ui/Toast';
import { useDebounce } from '@/hooks/useDebounce';
import { BuildingOfficeIcon, PlusIcon, PencilIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { USER_ROLES, Facility, CreateFacilityInput, UpdateFacilityInput } from '@/types';
import { facilityService } from '@/lib/services/facilityService';
import FacilityManagementForm from '@/components/forms/FacilityManagementForm';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

export default function FacilityManagementPage() {
  const { data: session, status } = useSession();
  const { error: showError, success: showSuccess } = useToastHelpers();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const isAdmin = session?.user?.role === USER_ROLES.ADMIN || session?.user?.role === USER_ROLES.NATIONAL_OFFICER;

  useEffect(() => {
    const loadFacilities = async () => {
      try {
        const data = await facilityService.getAllFacilities();
        setFacilities(data);
      } catch (error) {
        console.error('Error loading facilities:', error);
        showError('Failed to load facilities');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      loadFacilities();
    }
  }, [status, showError]);

  const filteredFacilities = facilities.filter(f => {
    const matchesSearch = !debouncedSearchTerm ||
      f.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      f.code.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      f.district.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

    const matchesType = !typeFilter || f.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleCreateOrUpdate = async (formData: CreateFacilityInput | UpdateFacilityInput) => {
    try {
      if (editingFacility) {
        await facilityService.updateFacility(editingFacility.id, formData as UpdateFacilityInput);
        showSuccess('Facility updated successfully');
      } else {
        await facilityService.createFacility(formData as CreateFacilityInput);
        showSuccess('Facility created successfully');
      }
      setShowModal(false);
      setEditingFacility(null);
      // Reload
      const data = await facilityService.getAllFacilities();
      setFacilities(data);
    } catch {
      showError(editingFacility ? 'Failed to update facility' : 'Failed to create facility');
    }
  };

  const handleToggleStatus = async (facility: Facility) => {
    const action = facility.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this facility?`)) return;

    try {
      await facilityService.updateFacility(facility.id, { isActive: !facility.isActive });
      showSuccess(`Facility ${action}d successfully`);
      const data = await facilityService.getAllFacilities();
      setFacilities(data);
    } catch {
      showError(`Failed to ${action} facility`);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BuildingOfficeIcon className="h-6 w-6 text-blue-700" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Facility Management</h1>
            <p className="text-gray-600">Manage health facilities and reporting centers</p>
          </div>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setEditingFacility(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Facility
          </Button>
        )}
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              label="Search facility"
              placeholder="Enter code, name, ..etc"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <SearchableSelect
            placeholder="Filter by type"
            value={typeFilter}
            onChange={(val) => setTypeFilter(val || '')}
            options={[
              { value: '', label: 'All Types' },
              { value: 'health_center', label: 'Health Center' },
              { value: 'hospital', label: 'Hospital' },
              { value: 'clinic', label: 'Clinic' },
              { value: 'dispensary', label: 'Dispensary' },
              { value: 'medical_center', label: 'Medical Center' },
            ]}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Code</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">District</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Contact</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFacilities.map((facility) => (
                <tr key={facility.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 font-medium">{facility.name}</td>
                  <td className="py-3 px-4 text-gray-600">{facility.code}</td>
                  <td className="py-3 px-4 text-gray-600 capitalize">{facility.type.replace('_', ' ')}</td>
                  <td className="py-3 px-4 text-gray-600 capitalize">{facility.district}</td>
                  <td className="py-3 px-4 text-gray-600">
                    <div>{facility.contactPerson}</div>
                    <div className="text-xs text-gray-400">{facility.phone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${facility.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {facility.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingFacility(facility);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(facility)}
                        className={`p-2 rounded ${facility.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'
                          }`}
                        title={facility.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredFacilities.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No facilities found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingFacility(null);
        }}
        title={editingFacility ? 'Edit Facility' : 'Add New Facility'}
      >
        <FacilityManagementForm
          initialData={editingFacility || undefined}
          isEditing={!!editingFacility}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => {
            setShowModal(false);
            setEditingFacility(null);
          }}
        />
      </Modal>
    </div>
  );
}
