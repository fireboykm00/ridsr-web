'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Modal } from '@/components/ui/Modal';
import { useToastHelpers } from '@/components/ui/Toast';
import {
  ArrowLeftIcon,
  UserIcon,
  DocumentTextIcon,
  BeakerIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Case, Patient, ValidationStatus, OutcomeStatus, USER_ROLES, UserRole } from '@/types';
import { getCaseById, updateCase, canAccessCase } from '@/lib/services/caseService';
import { canValidateCase } from '@/lib/middleware/rbac';

interface CaseLabResult {
  id?: string;
  _id?: string;
  testType: string;
  testName: string;
  testDate: string;
  resultValue: string;
  resultUnit?: string;
  interpretation: string;
}

export default function CaseDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToastHelpers();
  const caseId = params.caseId as string;

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [labResults, setLabResults] = useState<CaseLabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLabResults, setLoadingLabResults] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('pending');
  const [outcome, setOutcome] = useState<OutcomeStatus>('recovered');
  const resolvedCaseId = caseData?.id || (caseData as (Case & { _id?: string }) | null)?._id || caseId;

  const userCanValidate = session?.user && session.user.id && session.user.role && canValidateCase({
    id: session.user.id,
    role: session.user.role,
    facilityId: session.user.facilityId,
    district: session.user.district
  });

  const userCanUpdateOutcome = session?.user?.role && [
    USER_ROLES.HEALTH_WORKER,
    USER_ROLES.LAB_TECHNICIAN,
    USER_ROLES.DISTRICT_OFFICER,
    USER_ROLES.ADMIN,
    USER_ROLES.NATIONAL_OFFICER
  ].includes(session.user.role as UserRole);

  useEffect(() => {
    const loadCaseData = async () => {
      if (status === 'authenticated' && session?.user) {
        try {
          const caseDetails = await getCaseById(caseId);
          if (!caseDetails) {
            showError('Case not found');
            router.push('/dashboard/cases');
            return;
          }

          // Check access permissions
          const hasAccess = await canAccessCase(caseDetails);
          if (!hasAccess) {
            showError('Access denied');
            router.push('/dashboard/cases');
            return;
          }

          setCaseData(caseDetails);
          setValidationStatus(caseDetails.validationStatus);
          if (caseDetails.outcome) {
            setOutcome(caseDetails.outcome);
          }

          // Load patient and lab result data
          const [patientResponse, labResultsResponse] = await Promise.all([
            fetch(`/api/patients/${caseDetails.patientId}`),
            fetch(`/api/cases/${caseId}/lab-results`),
          ]);
          if (patientResponse.ok) {
            const patientJson = await patientResponse.json();
            setPatientData((patientJson.data || patientJson) as Patient);
          }
          if (labResultsResponse.ok) {
            const labJson = await labResultsResponse.json();
            const data = labJson.data || [];
            setLabResults(Array.isArray(data) ? data : []);
          } else {
            setLabResults([]);
          }
        } catch (error) {
          console.error('Error loading case:', error);
          showError('Failed to load case details');
        } finally {
          setLoadingLabResults(false);
          setLoading(false);
        }
      }
    };

    loadCaseData();
  }, [status, session, caseId, showError, router]);

  const handleValidationUpdate = async () => {
    if (!caseData) return;

    setUpdating(true);
    try {
      const updatedCase = await updateCase(resolvedCaseId, {
        validationStatus
      });

      if (updatedCase) {
        setCaseData(updatedCase);
        setShowValidationModal(false);
        showSuccess('Validation status updated successfully');
      } else {
        showError('Failed to update validation status');
      }
    } catch (error) {
      console.error('Error updating validation:', error);
      showError('Failed to update validation status');
    } finally {
      setUpdating(false);
    }
  };

  const handleOutcomeUpdate = async () => {
    if (!caseData) return;

    setUpdating(true);
    try {
      const updatedCase = await updateCase(resolvedCaseId, {
        outcome
      });

      if (updatedCase) {
        setCaseData(updatedCase);
        setShowOutcomeModal(false);
        showSuccess('Case outcome updated successfully');
      } else {
        showError('Failed to update case outcome');
      }
    } catch (error) {
      console.error('Error updating outcome:', error);
      showError('Failed to update case outcome');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: ValidationStatus) => {
    const variants = {
      pending: 'warning',
      validated: 'success',
      rejected: 'error'
    } as const;
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getOutcomeBadge = (outcomeStatus: OutcomeStatus) => {
    const variants = {
      recovered: 'success',
      deceased: 'error',
      transferred: 'info',
      unknown: 'warning'
    } as const;
    return <Badge variant={variants[outcomeStatus]}>{outcomeStatus}</Badge>;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground">Please sign in to view case details</p>
        </Card>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">Case not found</h2>
          <Link href="/dashboard/cases">
            <Button variant="secondary">Back to Cases</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/cases">
            <Button variant="secondary" size="sm" className="flex items-center gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Cases
            </Button>
          </Link>
          <div>
              <h1 className="text-3xl font-bold text-foreground">
              Case #{resolvedCaseId.substring(0, 8)}
            </h1>
            <p className="text-muted-foreground">Case Details and Management</p>
          </div>
        </div>
        <div className="flex gap-3">
          {userCanValidate && (
            <Button
              onClick={() => setShowValidationModal(true)}
              className="flex items-center gap-2"
            >
              <CheckCircleIcon className="h-5 w-5" />
              Update Validation
            </Button>
          )}
          {userCanUpdateOutcome && (
            <Button
              variant="secondary"
              onClick={() => setShowOutcomeModal(true)}
              className="flex items-center gap-2"
            >
              <DocumentTextIcon className="h-5 w-5" />
              Update Outcome
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <DocumentTextIcon className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Case Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Disease Code</p>
              <p className="text-foreground font-medium">{caseData.diseaseCode}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Validation Status</p>
              {getStatusBadge(caseData.validationStatus)}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Report Date</p>
              <p className="text-foreground font-medium">
                {new Date(caseData.reportDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Onset Date</p>
              <p className="text-foreground font-medium">
                {new Date(caseData.onsetDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outcome</p>
              {caseData.outcome ? (
                getOutcomeBadge(caseData.outcome)
              ) : (
                <span className="text-muted-foreground/60">Not specified</span>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Facility ID</p>
              <p className="text-foreground font-medium">{caseData.facilityId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reporter ID</p>
              <p className="text-foreground font-medium">{caseData.reporterId}</p>
            </div>
          </div>
        </Card>

        {/* Patient Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <UserIcon className="h-6 w-6 text-green-600" />
            <h2 className="text-lg font-semibold text-foreground">Patient Information</h2>
          </div>
          {patientData ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Patient ID</p>
                <p className="text-foreground font-medium">{patientData.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="text-foreground font-medium">
                  {patientData.firstName} {patientData.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">National ID</p>
                <p className="text-foreground font-medium">{patientData.nationalId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="text-foreground font-medium">
                  {new Date(patientData.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="text-foreground font-medium capitalize">{patientData.gender}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="text-foreground font-medium">{patientData.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">District</p>
                <p className="text-foreground font-medium capitalize">
                  {patientData.district.replace('_', ' ')}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading patient information...</p>
            </div>
          )}
        </Card>

        {/* Symptoms and Lab Results */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <BeakerIcon className="h-6 w-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-foreground">Clinical Information</h2>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Symptoms</h3>
              {caseData.symptoms && caseData.symptoms.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {caseData.symptoms.map((symptom, index) => (
                    <Badge key={index} variant="info">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No symptoms recorded</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Lab Results</h3>
              {loadingLabResults ? (
                <p className="text-muted-foreground text-sm">Loading lab results...</p>
              ) : labResults.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {labResults.map((result, index) => (
                    <div
                      key={result.id || result._id || `lab-result-${index}`}
                      className="rounded-md bg-muted p-3"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {result.testName} ({result.testType})
                      </p>
                      <p className="text-sm text-foreground/80">
                        {result.resultValue} {result.resultUnit || ''} - {result.interpretation}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(result.testDate).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No lab results recorded for this case</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Validation Modal */}
      <Modal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        title="Update Validation Status"
      >
        <div className="space-y-4">
          <SearchableSelect
            label="Validation Status"
            value={validationStatus}
            onChange={(value) => setValidationStatus(value as ValidationStatus)}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'validated', label: 'Validated' },
              { value: 'rejected', label: 'Rejected' }
            ]}
          />
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleValidationUpdate}
              disabled={updating}
              fullWidth
            >
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowValidationModal(false)}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Outcome Modal */}
      <Modal
        isOpen={showOutcomeModal}
        onClose={() => setShowOutcomeModal(false)}
        title="Update Case Outcome"
      >
        <div className="space-y-4">
          <SearchableSelect
            label="Case Outcome"
            value={outcome}
            onChange={(value) => setOutcome(value as OutcomeStatus)}
            options={[
              { value: 'recovered', label: 'Recovered' },
              { value: 'deceased', label: 'Deceased' },
              { value: 'transferred', label: 'Transferred' },
              { value: 'unknown', label: 'Unknown' }
            ]}
          />
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleOutcomeUpdate}
              disabled={updating}
              fullWidth
            >
              {updating ? 'Updating...' : 'Update Outcome'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowOutcomeModal(false)}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
