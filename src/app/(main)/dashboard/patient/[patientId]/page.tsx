'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Modal } from '@/components/ui/Modal';
import { useToastHelpers } from '@/components/ui/Toast';
import { PencilIcon, ArrowLeftIcon, UserIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { Patient, Case, RwandaDistrictType, Gender } from '@/types';
import { updatePatient } from '@/lib/services/patientService';

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

interface EditPatientData {
  firstName: string;
  lastName: string;
  phone: string;
  district: RwandaDistrictType;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export default function PatientDetailPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { data: session, status } = useSession();
  const { error: showError, success: showSuccess } = useToastHelpers();
  
  const [patientId, setPatientId] = useState<string>('');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [casesLoading, setCasesLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [editData, setEditData] = useState<EditPatientData>({
    firstName: '',
    lastName: '',
    phone: '',
    district: 'gasabo',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  // Unwrap params
  useEffect(() => {
    params.then(p => setPatientId(p.patientId));
  }, [params]);

  useEffect(() => {
    const loadPatient = async () => {
      if (status === 'authenticated' && session && patientId) {
        try {
          const response = await fetch(`/api/patients/${patientId}`);
          if (response.ok) {
            const data = await response.json();
            setPatient(data);
            
            // Initialize edit form data
            setEditData({
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              phone: data.phone || '',
              district: data.district || data.address?.district || 'gasabo',
              emergencyContact: {
                name: data.emergencyContact?.name || '',
                phone: data.emergencyContact?.phone || '',
                relationship: data.emergencyContact?.relationship || ''
              }
            });
          }
        } catch (error) {
          console.error('Error loading patient:', error);
          showError('Failed to load patient details');
        } finally {
          setLoading(false);
        }
      }
    };

    loadPatient();
  }, [status, session, patientId, showError]);

  useEffect(() => {
    const loadCases = async () => {
      if (!patient || !patientId) return;
      
      setCasesLoading(true);
      try {
        const response = await fetch(`/api/cases?patientId=${patientId}`);
        if (response.ok) {
          const data = await response.json();
          // Handle nested data structure: { success: true, data: { data: [...] } }
          const casesArray = data.data?.data || data.data || data || [];
          setCases(Array.isArray(casesArray) ? casesArray : []);
        }
      } catch (error) {
        console.error('Error loading cases:', error);
        setCases([]);
      } finally {
        setCasesLoading(false);
      }
    };

    loadCases();
  }, [patient, patientId]);

  const handleEditPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editData.firstName || !editData.lastName) {
      showError('First name and last name are required');
      return;
    }

    if (!patientId) return;

    try {
      const updatedPatient = await updatePatient(patientId, editData);
      if (updatedPatient) {
        setPatient(updatedPatient);
        setShowEditModal(false);
        showSuccess('Patient updated successfully');
      } else {
        showError('Failed to update patient');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      showError('Failed to update patient');
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Patient not found</h2>
          <Link href="/dashboard/patient" className="text-blue-600 hover:underline mt-4 inline-block">
            Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  const age = calculateAge(patient.dateOfBirth);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/patient" 
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <UserIcon className="h-6 w-6 text-blue-700" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {patient.firstName} {patient.lastName}
                </h1>
                <p className="text-gray-600">Patient Details</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2"
          >
            <PencilIcon className="h-4 w-4" />
            Edit Patient
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Demographics */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Demographics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="text-gray-900 font-medium">{age} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="text-gray-900 font-medium capitalize">{patient.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="text-gray-900 font-medium">{formatDate(patient.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">National ID</p>
                  <p className="text-gray-900 font-medium">{patient.nationalId}</p>
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-gray-900 font-medium">{patient.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900 font-medium">{patient.email || 'Not provided'}</p>
                </div>
              </div>
            </Card>

            {/* Address */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">District</p>
                  <p className="text-gray-900 font-medium capitalize">
                    {patient.district || patient.address?.district || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sector</p>
                  <p className="text-gray-900 font-medium">
                    {patient.address?.sector || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Street</p>
                  <p className="text-gray-900 font-medium">
                    {patient.address?.street || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Province</p>
                  <p className="text-gray-900 font-medium">
                    {patient.address?.province || 'Not specified'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Emergency Contact */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-gray-900 font-medium">
                    {patient.emergencyContact?.name || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-gray-900 font-medium">
                    {patient.emergencyContact?.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Relationship</p>
                  <p className="text-gray-900 font-medium">
                    {patient.emergencyContact?.relationship || 'Not specified'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Additional Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Occupation</p>
                  <p className="text-gray-900 font-medium">
                    {patient.occupation || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-gray-900 font-medium">
                    {formatDate(patient.createdAt)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Case History Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardDocumentListIcon className="h-5 w-5 text-blue-700" />
                <h2 className="text-lg font-semibold text-gray-900">Case History</h2>
              </div>
              
              {casesLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-700"></div>
                </div>
              ) : cases.length === 0 ? (
                <p className="text-gray-500 text-sm">No cases found for this patient</p>
              ) : (
                <div className="space-y-3">
                  {cases.slice(0, 5).map((caseItem) => (
                    <div key={caseItem.id} className="border-l-4 border-blue-200 pl-3 py-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-gray-900">
                          {caseItem.disease || 'Unknown Disease'}
                        </p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          caseItem.status === 'confirmed' ? 'bg-red-100 text-red-800' :
                          caseItem.status === 'suspected' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {caseItem.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatDate(caseItem.createdAt)}
                      </p>
                    </div>
                  ))}
                  {cases.length > 5 && (
                    <Link 
                      href={`/dashboard/cases?patientId=${params.patientId}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View all {cases.length} cases
                    </Link>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Edit Patient Modal */}
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Patient">
          <form onSubmit={handleEditPatient} className="space-y-4">
            <Input
              label="First Name"
              value={editData.firstName}
              onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
              required
            />

            <Input
              label="Last Name"
              value={editData.lastName}
              onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
              required
            />

            <Input
              label="Phone"
              type="tel"
              value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            />

            <SearchableSelect
              label="District"
              value={editData.district}
              onChange={(value) => setEditData({ ...editData, district: value as RwandaDistrictType })}
              options={DISTRICTS}
            />

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Emergency Contact</h3>
              
              <Input
                label="Contact Name"
                value={editData.emergencyContact.name}
                onChange={(e) => setEditData({ 
                  ...editData, 
                  emergencyContact: { ...editData.emergencyContact, name: e.target.value }
                })}
              />

              <Input
                label="Contact Phone"
                type="tel"
                value={editData.emergencyContact.phone}
                onChange={(e) => setEditData({ 
                  ...editData, 
                  emergencyContact: { ...editData.emergencyContact, phone: e.target.value }
                })}
              />

              <Input
                label="Relationship"
                value={editData.emergencyContact.relationship}
                onChange={(e) => setEditData({ 
                  ...editData, 
                  emergencyContact: { ...editData.emergencyContact, relationship: e.target.value }
                })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" fullWidth>
                Update Patient
              </Button>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => setShowEditModal(false)}
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