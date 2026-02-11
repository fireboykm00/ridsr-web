'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Modal } from '@/components/ui/Modal';
import { useToastHelpers } from '@/components/ui/Toast';
import { UserGroupIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { USER_ROLES, Patient } from '@/types';
import { patientService } from '@/lib/services/patientService';

interface PatientFormData {
  firstName: string;
  lastName: string;
  nationalId: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
}

export default function PatientsPage() {
  const { data: session, status } = useSession();
  const { error: showError, success: showSuccess } = useToastHelpers();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    nationalId: '',
    dateOfBirth: '',
    gender: 'male',
    phone: '',
    email: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (status === 'authenticated' && session) {
        try {
          // TODO: Fetch from API
          setPatients([]);
        } catch (error) {
          console.error('Error loading patients:', error);
          showError('Failed to load patients');
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [status, session, showError]);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.nationalId) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      // TODO: Call API to create patient
      showSuccess('Patient created successfully');
      setShowModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        nationalId: '',
        dateOfBirth: '',
        gender: 'male',
        phone: '',
        email: ''
      });
    } catch (error) {
      showError('Failed to create patient');
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.nationalId.includes(searchTerm)
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
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

        {/* Search */}
        <Card className="p-6 mb-6">
          <Input
            placeholder="Search by name or national ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
          />
        </Card>

        {/* Patients Table */}
        <Card className="p-6">
          {filteredPatients.length === 0 ? (
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
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">DOB</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Gender</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{patient.firstName} {patient.lastName}</td>
                      <td className="py-3 px-4 text-gray-900">{patient.nationalId}</td>
                      <td className="py-3 px-4 text-gray-900">{patient.dateOfBirth}</td>
                      <td className="py-3 px-4 text-gray-900 capitalize">{patient.gender}</td>
                      <td className="py-3 px-4 text-gray-900">{patient.phone}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                            <TrashIcon className="h-4 w-4" />
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
              onChange={(value) => setFormData({ ...formData, gender: value })}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' }
              ]}
            />

            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
