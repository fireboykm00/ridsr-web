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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFacilities, setTotalFacilities] = useState(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const isAdmin = session?.user?.role === USER_ROLES.ADMIN || session?.user?.role === USER_ROLES.NATIONAL_OFFICER;

  useEffect(() => {
    const loadFacilities = async () => {
      if (status !== 'authenticated') return;
      setLoading(true);
      try {
        const result = await facilityService.getFacilitiesWithFilters({
          search: debouncedSearchTerm || undefined,
          type: typeFilter || undefined,
          isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
          page: currentPage,
          limit: 20,
        });
        setFacilities(result.data);
        setTotalFacilities(result.total);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error('Error loading facilities:', error);
        showError('Failed to load facilities');
      } finally {
        setLoading(false);
      }
    };

    void loadFacilities();
  }, [status, showError, debouncedSearchTerm, typeFilter, statusFilter, currentPage]);

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
      const result = await facilityService.getFacilitiesWithFilters({
        search: debouncedSearchTerm || undefined,
        type: typeFilter || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        page: currentPage,
        limit: 20,
      });
      setFacilities(result.data);
      setTotalFacilities(result.total);
      setTotalPages(result.totalPages);
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
      const result = await facilityService.getFacilitiesWithFilters({
        search: debouncedSearchTerm || undefined,
        type: typeFilter || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        page: currentPage,
        limit: 20,
      });
      setFacilities(result.data);
      setTotalFacilities(result.total);
      setTotalPages(result.totalPages);
    } catch {
      showError(`Failed to ${action} facility`);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BuildingOfficeIcon className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Facility Management</h1>
            <p className="text-muted-foreground">Manage health facilities and reporting centers</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              label="Search facility"
              placeholder="Enter code, name, ..etc"
              value={searchTerm}
              onChange={(e) => {
                setCurrentPage(1);
                setSearchTerm(e.target.value);
              }}
              className="pl-10"
            />
          </div>
          <SearchableSelect
            placeholder="Filter by type"
            value={typeFilter}
            onChange={(val) => {
              setCurrentPage(1);
              setTypeFilter(val || '');
            }}
            options={[
              { value: '', label: 'All Types' },
              { value: 'health_center', label: 'Health Center' },
              { value: 'hospital', label: 'Hospital' },
              { value: 'clinic', label: 'Clinic' },
              { value: 'dispensary', label: 'Dispensary' },
              { value: 'medical_center', label: 'Medical Center' },
            ]}
          />
          <SearchableSelect
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(val) => {
              setCurrentPage(1);
              setStatusFilter(val || 'all');
            }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </div>
        <p className="text-sm text-muted-foreground mb-4">Showing {facilities.length} of {totalFacilities} facilities</p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Code</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">District</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Contact</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((facility) => (
                <tr key={facility.id} className="border-b border-border hover:bg-muted">
                  <td className="py-3 px-4 text-foreground font-medium">{facility.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{facility.code}</td>
                  <td className="py-3 px-4 text-muted-foreground capitalize">{facility.type.replace('_', ' ')}</td>
                  <td className="py-3 px-4 text-muted-foreground capitalize">{facility.district}</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    <div>{facility.contactPerson}</div>
                    <div className="text-xs text-muted-foreground/60">{facility.phone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${facility.isActive ? 'bg-green-100 text-green-800' : 'bg-destructive/10 text-destructive'
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
                        className="p-2 text-primary hover:bg-primary/5 rounded"
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
              {facilities.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No facilities found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
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
