'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Modal } from '@/components/ui/Modal';
import { useToastHelpers } from '@/components/ui/Toast';
import { BuildingOfficeIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { USER_ROLES, Facility, FacilityType, RWANDA_DISTRICTS, RWANDA_PROVINCES } from '@/types';
import { facilityService } from '@/lib/services/facility-service';

interface FacilityFormData {
  name: string;
  type: FacilityType;
  district: string;
  province: string;
  address: string;
  phone: string;
}

const FACILITY_TYPES: { value: FacilityType; label: string }[] = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'health_center', label: 'Health Center' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'laboratory', label: 'Laboratory' },
];

export default function FacilitiesPage() {
  const { data: session, status } = useSession();
  const { error: showError, success: showSuccess } = useToastHelpers();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<FacilityFormData>({
    name: '',
    type: 'health_center',
    district: '',
    province: '',
    address: '',
    phone: ''
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
          const facilitiesData = await facilityService.getAllFacilities();
          setFacilities(facilitiesData);
        } catch (error) {
          console.error('Error loading facilities:', error);
          showError('Failed to load facilities');
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [status, session, showError]);

  const handleAddFacility = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.district || !formData.province) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      await facilityService.createFacility({
        name: formData.name,
        type: formData.type,
        district: formData.district as any,
        province: formData.province as any,
        address: formData.address,
        phone: formData.phone,
        isActive: true
      });

      showSuccess('Facility created successfully');
      setShowModal(false);
      setFormData({
        name: '',
        type: 'health_center',
        district: '',
        province: '',
        address: '',
        phone: ''
      });

      // Reload facilities
      const updatedFacilities = await facilityService.getAllFacilities();
      setFacilities(updatedFacilities);
    } catch (error) {
      showError('Failed to create facility');
    }
  };

  const handleDeleteFacility = async (facilityId: string) => {
    if (!confirm('Are you sure you want to delete this facility?')) return;

    try {
      await facilityService.deleteFacility(facilityId);
      showSuccess('Facility deleted successfully');
      setFacilities(facilities.filter(f => f.id !== facilityId));
    } catch (error) {
      showError('Failed to delete facility');
    }
  };

  const filteredFacilities = facilities.filter(facility =>
    facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.district.toLowerCase().includes(searchTerm.toLowerCase())
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
          <p className="text-gray-600">Only administrators can manage facilities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BuildingOfficeIcon className="h-6 w-6 text-blue-700" />
            <h1 className="text-2xl font-bold text-gray-900">Facility Management</h1>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Facility
          </Button>
        </div>

        {/* Search */}
        <Card className="p-6 mb-6">
          <Input
            placeholder="Search by name or district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
          />
        </Card>

        {/* Facilities Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">District</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Province</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFacilities.map((facility) => (
                  <tr key={facility.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{facility.name}</td>
                    <td className="py-3 px-4 text-gray-900 capitalize">{facility.type.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-gray-900 capitalize">{facility.district}</td>
                    <td className="py-3 px-4 text-gray-900 capitalize">{facility.province}</td>
                    <td className="py-3 px-4 text-gray-900">{facility.phone || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFacility(facility.id)}
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

        {/* Add Facility Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Facility">
          <form onSubmit={handleAddFacility} className="space-y-4">
            <Input
              label="Facility Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <SearchableSelect
              label="Type"
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value as FacilityType })}
              options={FACILITY_TYPES}
              required
            />

            <SearchableSelect
              label="Province"
              value={formData.province}
              onChange={(value) => setFormData({ ...formData, province: value })}
              options={RWANDA_PROVINCES.map(p => ({ value: p, label: p.replace('_', ' ') }))}
              required
            />

            <SearchableSelect
              label="District"
              value={formData.district}
              onChange={(value) => setFormData({ ...formData, district: value })}
              options={RWANDA_DISTRICTS.map(d => ({ value: d, label: d.replace('_', ' ') }))}
              required
            />

            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" fullWidth>
                Create Facility
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
