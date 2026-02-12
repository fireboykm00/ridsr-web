'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Modal } from '@/components/ui/Modal';
import { useToastHelpers } from '@/components/ui/Toast';
import { UserGroupIcon, PlusIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Patient, RwandaDistrictType, Gender, USER_ROLES } from '@/types';
import { createPatient } from '@/lib/services/patientService';
import { useDebounce } from '@/hooks/useDebounce';

interface PatientFormData {
  firstName: string;
  lastName: string;
  nationalId: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  district: RwandaDistrictType;
}

const DISTRICTS = [
  { value: 'gasabo', label: 'Gasabo' },
  { value: 'kicukiro', label: 'Kicukiro' },
  { value: 'nyarugenge', label: 'Nyarugenge' },
  { value: 'bugesera', label: 'Bugesera' },
  { value: 'gatsibo', label: 'Gatsibo' },
  { value: 'kayonza', label: 'Kayonza' },
  { value: 'kirehe', label: 'Kirehe' },
  { value: 'ngoma', label: 'Ngoma' },
  { value: 'nyagatare', label: 'Nyagatare' },
  { value: 'rwamagana', label: 'Rwamagana' },
];

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export default function PatientsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { error: showError, success: showSuccess } = useToastHelpers();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const canAccessPatients = session?.user?.role !== USER_ROLES.LAB_TECHNICIAN;

  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    nationalId: '',
    dateOfBirth: '',
    gender: 'male',
    phone: '',
    district: 'gasabo'
  });

  const loadPatients = useCallback(async () => {
    if (status !== 'authenticated' || !session) return;
    if (session.user?.role === USER_ROLES.LAB_TECHNICIAN) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (districtFilter) params.append('district', districtFilter);
      if (genderFilter) params.append('gender', genderFilter);

      const response = await fetch(`/api/patients?${params}`);
      if (!response.ok) throw new Error('Failed to fetch patients');

      const json = await response.json();
      const result = json.data || json; // Handle wrapped or direct response
      setPatients(result.data || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error('Error loading patients:', error);
      showError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [status, session, currentPage, debouncedSearchTerm, districtFilter, genderFilter, showError]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.nationalId) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      await createPatient({
        firstName: formData.firstName,
        lastName: formData.lastName,
        nationalId: formData.nationalId,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone,
        district: formData.district,
      });

      showSuccess('Patient created successfully');
      setShowModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        nationalId: '',
        dateOfBirth: '',
        gender: 'male',
        phone: '',
        district: 'gasabo'
      });

      // Refresh the patient list
      loadPatients();
    } catch {
      showError('Failed to create patient');
    }
  };

  const handleViewPatient = (patientId: string) => {
    router.push(`/dashboard/patient/${patientId}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDistrictFilter(null);
    setGenderFilter(null);
    setCurrentPage(1);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (status === 'authenticated' && !canAccessPatients) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">
            Lab technicians do not have access to the patients page.
          </p>
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
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Patient
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by name, ID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
            />

            <SearchableSelect
              placeholder="Filter by district"
              value={districtFilter}
              onChange={setDistrictFilter}
              options={DISTRICTS}
              isClearable
            />

            <SearchableSelect
              placeholder="Filter by gender"
              value={genderFilter}
              onChange={setGenderFilter}
              options={GENDERS}
              isClearable
            />

            <Button
              variant="secondary"
              onClick={clearFilters}
              className="h-12"
            >
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {patients.length} of {total} patients
          </p>
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* Patients Table */}
        <Card className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-700"></div>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No patients found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">National ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Gender</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">District</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length > 0 && patients.map((patient, index) => (
                    <tr key={patient.firstName + index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </td>
                      <td className="py-3 px-4 text-gray-900">{patient.nationalId}</td>
                      <td className="py-3 px-4 text-gray-900 capitalize">{patient.gender}</td>
                      <td className="py-3 px-4 text-gray-900 capitalize">
                        {patient.address?.district || patient.district || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-900">{patient.phone}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewPatient(patient._id || patient.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleViewPatient(patient._id || patient.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Edit Patient"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center space-x-2">
            <Button
              variant="secondary"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "primary" : "secondary"}
                  onClick={() => setCurrentPage(page)}
                  className="w-10"
                >
                  {page}
                </Button>
              );
            })}

            <Button
              variant="secondary"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Add Patient Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Patient">
          <form onSubmit={handleAddPatient} className="space-y-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />

            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />

            <Input
              label="National ID"
              value={formData.nationalId}
              onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
              required
            />

            <Input
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />

            <SearchableSelect
              label="Gender"
              value={formData.gender}
              onChange={(value) => setFormData({ ...formData, gender: value as Gender })}
              options={GENDERS}
            />

            <SearchableSelect
              label="District"
              value={formData.district}
              onChange={(value) => setFormData({ ...formData, district: value as RwandaDistrictType })}
              options={DISTRICTS}
            />

            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" fullWidth>
                Create Patient
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
