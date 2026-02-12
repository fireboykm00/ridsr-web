'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToastHelpers } from '@/components/ui/Toast';
import { CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { USER_ROLES, Case, ValidationStatus } from '@/types';

interface ValidationCase extends Case {
  patient?: {
    id: string;
    nationalId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    district: string;
  };
  facility?: {
    id: string;
    name: string;
    code: string;
    type: string;
    district: string;
  };
  reporter?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface CaseDetailModalProps {
  case: ValidationCase | null;
  isOpen: boolean;
  onClose: () => void;
  onValidate: (caseId: string, status: ValidationStatus) => void;
  isValidating: boolean;
}

function CaseDetailModal({ case: caseItem, isOpen, onClose, onValidate, isValidating }: CaseDetailModalProps) {
  if (!isOpen || !caseItem) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Case Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Case Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Case Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Case ID</label>
                  <p className="text-gray-900">{caseItem.id.substring(0, 8)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Disease Code</label>
                  <p className="text-gray-900">{caseItem.diseaseCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Onset Date</label>
                  <p className="text-gray-900">{new Date(caseItem.onsetDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Report Date</label>
                  <p className="text-gray-900">{new Date(caseItem.reportDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Patient Information */}
            {caseItem.patient && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900">{caseItem.patient.firstName} {caseItem.patient.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">National ID</label>
                    <p className="text-gray-900">{caseItem.patient.nationalId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="text-gray-900">{new Date(caseItem.patient.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Gender</label>
                    <p className="text-gray-900 capitalize">{caseItem.patient.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{caseItem.patient.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">District</label>
                    <p className="text-gray-900 capitalize">{caseItem.patient.district.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Symptoms */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Symptoms</h3>
              <div className="flex flex-wrap gap-2">
                {caseItem.symptoms.map((symptom, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            {/* Facility Information */}
            {caseItem.facility && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Reporting Facility</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Facility Name</label>
                    <p className="text-gray-900">{caseItem.facility.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Facility Code</label>
                    <p className="text-gray-900">{caseItem.facility.code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <p className="text-gray-900 capitalize">{caseItem.facility.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">District</label>
                    <p className="text-gray-900 capitalize">{caseItem.facility.district.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reporter Information */}
            {caseItem.reporter && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Reported By</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900">{caseItem.reporter.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <p className="text-gray-900 capitalize">{caseItem.reporter.role.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isValidating}
            >
              Close
            </Button>
            <Button
              variant="danger"
              onClick={() => onValidate(caseItem.id, 'rejected')}
              disabled={isValidating}
              className="flex items-center gap-2"
            >
              <XCircleIcon className="h-4 w-4" />
              Reject
            </Button>
            <Button
              variant="primary"
              onClick={() => onValidate(caseItem.id, 'validated')}
              disabled={isValidating}
              className="flex items-center gap-2"
            >
              <CheckCircleIcon className="h-4 w-4" />
              Validate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ValidationHubPage() {
  const { data: session, status } = useSession();
  const { error: showError, success: showSuccess } = useToastHelpers();
  const [pendingCases, setPendingCases] = useState<ValidationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<ValidationCase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validatingCaseId, setValidatingCaseId] = useState<string | null>(null);

  useEffect(() => {
    const loadPendingCases = async () => {
      if (status === 'authenticated' && session) {
        // Check if user has validation permissions
        if (![USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER, USER_ROLES.DISTRICT_OFFICER].includes(session.user?.role as string)) {
          window.location.href = '/dashboard';
          return;
        }

        try {
          const response = await fetch('/api/validation/queue');
          if (!response.ok) {
            throw new Error('Failed to fetch validation queue');
          }
          
          const result = await response.json();
          if (result.success) {
            setPendingCases(result.data.data || []);
          } else {
            showError(result.error || 'Failed to load pending cases');
          }
        } catch (error) {
          console.error('Error loading pending cases:', error);
          showError('Failed to load pending cases');
        } finally {
          setLoading(false);
        }
      }
    };

    loadPendingCases();
  }, [status, session, showError]);

  const handleViewCase = (caseItem: ValidationCase) => {
    setSelectedCase(caseItem);
    setIsModalOpen(true);
  };

  const handleValidateCase = async (caseId: string, status: ValidationStatus) => {
    setValidatingCaseId(caseId);
    
    try {
      const response = await fetch(`/api/cases/validate/${caseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          validationStatus: status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate case');
      }

      const result = await response.json();
      if (result.success) {
        showSuccess(`Case ${status} successfully`);
        
        // Remove the validated case from the list
        setPendingCases(prev => prev.filter(c => c.id !== caseId));
        
        // Close modal if it's open
        setIsModalOpen(false);
        setSelectedCase(null);
      } else {
        showError(result.error || 'Failed to validate case');
      }
    } catch (error) {
      console.error('Error validating case:', error);
      showError('Failed to validate case');
    } finally {
      setValidatingCaseId(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!session || ![USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER, USER_ROLES.DISTRICT_OFFICER].includes(session.user?.role as string)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only district and national officers can access the validation hub</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Validation Hub</h1>
          <p className="text-gray-600 mt-2">Review and validate pending disease surveillance cases</p>
        </div>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Cases ({pendingCases.length})
            </h2>
          </div>

          {pendingCases.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending cases</h3>
              <p className="text-gray-600">All cases have been validated</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Case ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Disease
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Facility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingCases.map((caseItem) => (
                    <tr key={caseItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {caseItem.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {caseItem.patient ? 
                          `${caseItem.patient.firstName} ${caseItem.patient.lastName}` : 
                          'Unknown'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {caseItem.diseaseCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {caseItem.facility?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(caseItem.reportDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewCase(caseItem)}
                          className="flex items-center gap-1"
                        >
                          <EyeIcon className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleValidateCase(caseItem.id, 'rejected')}
                          disabled={validatingCaseId === caseItem.id}
                          className="flex items-center gap-1"
                        >
                          <XCircleIcon className="h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleValidateCase(caseItem.id, 'validated')}
                          disabled={validatingCaseId === caseItem.id}
                          className="flex items-center gap-1"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          Validate
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <CaseDetailModal
        case={selectedCase}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCase(null);
        }}
        onValidate={handleValidateCase}
        isValidating={validatingCaseId !== null}
      />
    </div>
  );
}