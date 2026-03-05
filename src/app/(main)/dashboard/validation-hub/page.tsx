'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useToastHelpers } from '@/components/ui/Toast';
import { CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { USER_ROLES, Case, ValidationStatus, UserRole, LabResultInterpretation } from '@/types';
import { z } from 'zod';
import { parseApiError, ApiClientError } from '@/lib/utils/apiError';
import { zodErrorToFieldMap } from '@/lib/utils/zod';

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

interface CaseLabResult {
  id?: string;
  _id?: string;
  testType: string;
  testName: string;
  testDate: string;
  resultValue: string;
  interpretation: LabResultInterpretation;
  resultUnit?: string;
  referenceRange?: string;
  technicianId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface LabResultForm {
  testType: string;
  testName: string;
  testDate: string;
  resultValue: string;
  interpretation: LabResultInterpretation;
  resultUnit: string;
  referenceRange: string;
}

const INITIAL_FORM: LabResultForm = {
  testType: '',
  testName: '',
  testDate: '',
  resultValue: '',
  interpretation: 'equivocal',
  resultUnit: '',
  referenceRange: '',
};

const HUB_ROLES: UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.NATIONAL_OFFICER,
  USER_ROLES.DISTRICT_OFFICER,
  USER_ROLES.LAB_TECHNICIAN,
];
const VALIDATOR_ROLES: UserRole[] = [USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER, USER_ROLES.DISTRICT_OFFICER];
const LAB_ACTION_ROLES: UserRole[] = [...VALIDATOR_ROLES, USER_ROLES.LAB_TECHNICIAN];

const labResultFormSchema = z.object({
  testType: z.string().min(1, 'Test type is required'),
  testName: z.string().min(1, 'Test name is required'),
  testDate: z.string().min(1, 'Test date is required'),
  resultValue: z.string().min(1, 'Result value is required'),
  interpretation: z.enum(['positive', 'negative', 'equivocal', 'contaminated']),
  resultUnit: z.string().optional(),
  referenceRange: z.string().optional(),
});

async function readApiError(response: Response, fallback: string): Promise<string> {
  try {
    const payload = await response.json();
    return payload?.message || payload?.error || fallback;
  } catch {
    return fallback;
  }
}

interface CaseDetailModalProps {
  caseItem: ValidationCase | null;
  isOpen: boolean;
  onClose: () => void;
  onValidate: (caseId: string, status: ValidationStatus) => void;
  isValidating: boolean;
  canValidate: boolean;
  canSubmitLabResult: boolean;
  labResults: CaseLabResult[];
  loadingLabResults: boolean;
  submittingLabResult: boolean;
  form: LabResultForm;
  formErrors: Record<string, string>;
  onFormFieldChange: (field: keyof LabResultForm, value: string) => void;
  onSubmitLabResult: () => void;
}

function CaseDetailModal({
  caseItem,
  isOpen,
  onClose,
  onValidate,
  isValidating,
  canValidate,
  canSubmitLabResult,
  labResults,
  loadingLabResults,
  submittingLabResult,
  form,
  formErrors,
  onFormFieldChange,
  onSubmitLabResult,
}: CaseDetailModalProps) {
  if (!isOpen || !caseItem) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[92vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Submit Lab Results</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
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

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Lab Results</h3>
              {loadingLabResults ? (
                <p className="text-gray-600 text-sm">Loading lab results...</p>
              ) : labResults.length === 0 ? (
                <p className="text-gray-600 text-sm">No lab results yet for this case.</p>
              ) : (
                <div className="space-y-2">
                  {labResults.map((result, index) => (
                    <div key={result.id || result._id || index} className="p-3 bg-gray-50 rounded-md text-sm">
                      <p className="font-medium text-gray-900">{result.testName} ({result.testType})</p>
                      <p className="text-gray-700">
                        {result.resultValue} {result.resultUnit || ''} - {result.interpretation}
                      </p>
                      <p className="text-gray-500 text-xs">{new Date(result.testDate).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {canSubmitLabResult && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Submit Lab Result</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Required: test type, test name, test date, result value, interpretation.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <input
                      className={`w-full rounded-md border px-3 py-2 text-sm ${formErrors.testType ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Test Type *"
                      value={form.testType}
                      onChange={(e) => onFormFieldChange('testType', e.target.value)}
                    />
                    {formErrors.testType && <p className="mt-1 text-xs text-red-600">{formErrors.testType}</p>}
                  </div>
                  <div>
                    <input
                      className={`w-full rounded-md border px-3 py-2 text-sm ${formErrors.testName ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Test Name *"
                      value={form.testName}
                      onChange={(e) => onFormFieldChange('testName', e.target.value)}
                    />
                    {formErrors.testName && <p className="mt-1 text-xs text-red-600">{formErrors.testName}</p>}
                  </div>
                  <div>
                    <input
                      className={`w-full rounded-md border px-3 py-2 text-sm ${formErrors.testDate ? 'border-red-500' : 'border-gray-300'}`}
                      type="datetime-local"
                      value={form.testDate}
                      onChange={(e) => onFormFieldChange('testDate', e.target.value)}
                    />
                    {formErrors.testDate && <p className="mt-1 text-xs text-red-600">{formErrors.testDate}</p>}
                  </div>
                  <div>
                    <input
                      className={`w-full rounded-md border px-3 py-2 text-sm ${formErrors.resultValue ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Result Value *"
                      value={form.resultValue}
                      onChange={(e) => onFormFieldChange('resultValue', e.target.value)}
                    />
                    {formErrors.resultValue && <p className="mt-1 text-xs text-red-600">{formErrors.resultValue}</p>}
                  </div>
                  <div>
                    <select
                      className={`w-full rounded-md border px-3 py-2 text-sm ${formErrors.interpretation ? 'border-red-500' : 'border-gray-300'}`}
                      value={form.interpretation}
                      onChange={(e) => onFormFieldChange('interpretation', e.target.value)}
                    >
                      <option value="positive">positive</option>
                      <option value="negative">negative</option>
                      <option value="equivocal">equivocal</option>
                      <option value="contaminated">contaminated</option>
                    </select>
                    {formErrors.interpretation && <p className="mt-1 text-xs text-red-600">{formErrors.interpretation}</p>}
                  </div>
                  <div>
                    <input
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Result Unit (optional)"
                      value={form.resultUnit}
                      onChange={(e) => onFormFieldChange('resultUnit', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Reference Range (optional)"
                      value={form.referenceRange}
                      onChange={(e) => onFormFieldChange('referenceRange', e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Button onClick={onSubmitLabResult} disabled={submittingLabResult}>
                    {submittingLabResult ? 'Submitting...' : 'Submit Lab Result'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <Button variant="secondary" onClick={onClose} disabled={isValidating}>
              Close
            </Button>
            {canValidate && (
              <>
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
              </>
            )}
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

  const [labResults, setLabResults] = useState<CaseLabResult[]>([]);
  const [loadingLabResults, setLoadingLabResults] = useState(false);
  const [submittingLabResult, setSubmittingLabResult] = useState(false);
  const [labForm, setLabForm] = useState<LabResultForm>(INITIAL_FORM);
  const [labFormErrors, setLabFormErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  const currentRole = session?.user?.role as UserRole | undefined;
  const canAccessHub = !!currentRole && HUB_ROLES.includes(currentRole);
  const canValidateCases = !!currentRole && VALIDATOR_ROLES.includes(currentRole);
  const canSubmitLabResult = !!currentRole && LAB_ACTION_ROLES.includes(currentRole);

  const setLabFieldError = (field: keyof LabResultForm, message?: string) => {
    setLabFormErrors((prev) => {
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  };

  const validateLabField = (field: keyof LabResultForm, value: string) => {
    if (field === 'testType') {
      const parsed = z.string().trim().min(1, 'Test type is required.').safeParse(value);
      setLabFieldError('testType', parsed.success ? undefined : parsed.error.issues[0]?.message);
      return;
    }
    if (field === 'testName') {
      const parsed = z.string().trim().min(1, 'Test name is required.').safeParse(value);
      setLabFieldError('testName', parsed.success ? undefined : parsed.error.issues[0]?.message);
      return;
    }
    if (field === 'testDate') {
      const parsed = z.string().trim().min(1, 'Test date is required.').safeParse(value);
      setLabFieldError('testDate', parsed.success ? undefined : parsed.error.issues[0]?.message);
      return;
    }
    if (field === 'resultValue') {
      const parsed = z.string().trim().min(1, 'Result value is required.').safeParse(value);
      setLabFieldError('resultValue', parsed.success ? undefined : parsed.error.issues[0]?.message);
      return;
    }
    if (field === 'interpretation') {
      const parsed = z.enum(['positive', 'negative', 'equivocal', 'contaminated']).safeParse(value);
      setLabFieldError('interpretation', parsed.success ? undefined : 'Interpretation is required.');
    }
  };

  const handleLabFormFieldChange = (field: keyof LabResultForm, value: string) => {
    setLabForm((prev) => ({ ...prev, [field]: value }));
    validateLabField(field, value);
  };

  const loadPendingCases = useCallback(async () => {
    try {
      const params = new URLSearchParams({ tab: 'pending' });
      if (searchTerm) params.set('search', searchTerm);
      if (diseaseFilter) params.set('diseaseCode', diseaseFilter);
      if (dateFromFilter) params.set('dateFrom', dateFromFilter);
      if (dateToFilter) params.set('dateTo', dateToFilter);

      const response = await fetch(`/api/validation/queue?${params.toString()}`);
      if (!response.ok) {
        throw new Error(await readApiError(response, 'Failed to fetch validation queue'));
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || result.error || 'Failed to load pending cases');
      }

      const normalizedCases = (result.data.data || []).map((caseItem: ValidationCase & { _id?: string }) => ({
        ...caseItem,
        id: caseItem.id || caseItem._id || '',
      }));
      setPendingCases(normalizedCases);
    } catch (error) {
      console.error('Error loading pending cases:', error);
      showError(error instanceof Error ? error.message : 'Failed to load pending cases');
    }
  }, [showError, searchTerm, diseaseFilter, dateFromFilter, dateToFilter]);

  useEffect(() => {
    const init = async () => {
      if (status !== 'authenticated' || !session) {
        return;
      }

      if (!canAccessHub) {
        window.location.href = '/dashboard';
        return;
      }

      setLoading(true);
      await loadPendingCases();
      setLoading(false);
    };

    void init();
  }, [status, session, canAccessHub, loadPendingCases]);

  const loadCaseLabResults = async (caseId: string) => {
    setLoadingLabResults(true);
    try {
      const response = await fetch(`/api/cases/${caseId}/lab-results`);
      if (!response.ok) {
        throw new Error(await readApiError(response, 'Failed to load lab results'));
      }
      const result = await response.json();
      const data = result?.data || [];
      setLabResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading lab results:', error);
      showError(error instanceof Error ? error.message : 'Failed to load lab results');
      setLabResults([]);
    } finally {
      setLoadingLabResults(false);
    }
  };

  const handleViewCase = async (caseItem: ValidationCase) => {
    setSelectedCase(caseItem);
    setIsModalOpen(true);
    setLabForm(INITIAL_FORM);
    setLabFormErrors({});
    await loadCaseLabResults(caseItem.id);
  };

  const handleSubmitLabResult = async () => {
    if (!selectedCase) return;
    const parsedForm = labResultFormSchema.safeParse(labForm);
    if (!parsedForm.success) {
      setLabFormErrors(zodErrorToFieldMap(parsedForm.error));
      showError(parsedForm.error.issues[0]?.message || 'Please correct the highlighted fields');
      return;
    }

    setSubmittingLabResult(true);
    try {
      const response = await fetch(`/api/cases/${selectedCase.id}/lab-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: labForm.testType,
          testName: labForm.testName,
          testDate: new Date(labForm.testDate).toISOString(),
          resultValue: labForm.resultValue,
          interpretation: labForm.interpretation,
          resultUnit: labForm.resultUnit || undefined,
          referenceRange: labForm.referenceRange || undefined,
        }),
      });

      if (!response.ok) {
        const parsed = await parseApiError(response, 'Failed to submit lab result');
        if (parsed.fieldErrors) {
          setLabFormErrors((prev) => ({ ...prev, ...parsed.fieldErrors }));
        }
        throw new ApiClientError(parsed.message, { fieldErrors: parsed.fieldErrors, status: response.status });
      }

      showSuccess('Lab result submitted successfully');
      setLabForm(INITIAL_FORM);
      setLabFormErrors({});
      await loadCaseLabResults(selectedCase.id);
      await loadPendingCases();
    } catch (error) {
      console.error('Error submitting lab result:', error);
      showError(error instanceof Error ? error.message : 'Failed to submit lab result');
    } finally {
      setSubmittingLabResult(false);
    }
  };

  const handleValidateCase = async (caseId: string, validationStatus: ValidationStatus) => {
    if (!canValidateCases) return;
    setValidatingCaseId(caseId);

    try {
      const response = await fetch(`/api/cases/validate/${caseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ validationStatus }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, 'Failed to validate case'));
      }

      showSuccess(`Case ${validationStatus} successfully`);
      setPendingCases((prev) => prev.filter((c) => c.id !== caseId));
      setIsModalOpen(false);
      setSelectedCase(null);
    } catch (error) {
      console.error('Error validating case:', error);
      showError(error instanceof Error ? error.message : 'Failed to validate case');
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

  if (!canAccessHub) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access the validation hub</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Validation Hub</h1>
          <p className="text-gray-600 mt-2">Review cases and submit laboratory results</p>
          <p className="text-gray-500 text-sm mt-1">After lab result submission, a case moves from pending to in-review queue.</p>
        </div>

        <Card className="p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              placeholder="Search cases"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchableSelect
              placeholder="Filter disease"
              value={diseaseFilter}
              onChange={(value) => setDiseaseFilter(value || '')}
              options={[
                { value: '', label: 'All diseases' },
                { value: 'CHOLERA', label: 'Cholera' },
                { value: 'MAL01', label: 'Malaria' },
                { value: 'SARI', label: 'SARI' },
                { value: 'EBOLA', label: 'Ebola' },
                { value: 'MONKEYPOX', label: 'Monkeypox' },
              ]}
            />
            <Input
              type="date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
            />
            <Input
              type="date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => {
              setSearchTerm('');
              setDiseaseFilter('');
              setDateFromFilter('');
              setDateToFilter('');
            }}>
              Clear Filters
            </Button>
            <Button variant="secondary" size="sm" onClick={() => void loadPendingCases()}>
              Apply
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Pending Cases ({pendingCases.length})</h2>
          </div>

          {pendingCases.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending cases</h3>
              <p className="text-gray-600">All pending cases are processed</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disease</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingCases.map((caseItem) => (
                    <tr key={caseItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{caseItem.id.substring(0, 8)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {caseItem.patient ? `${caseItem.patient.firstName} ${caseItem.patient.lastName}` : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{caseItem.diseaseCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{caseItem.facility?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(caseItem.reportDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button variant="secondary" size="sm" onClick={() => void handleViewCase(caseItem)} className="flex items-center gap-1">
                          <EyeIcon className="h-4 w-4" />
                          Submit Results
                        </Button>
                        {canValidateCases && (
                          <>
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
                          </>
                        )}
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
        caseItem={selectedCase}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCase(null);
          setLabResults([]);
          setLabForm(INITIAL_FORM);
          setLabFormErrors({});
        }}
        onValidate={handleValidateCase}
        isValidating={validatingCaseId !== null}
        canValidate={canValidateCases}
        canSubmitLabResult={canSubmitLabResult}
        labResults={labResults}
        loadingLabResults={loadingLabResults}
        submittingLabResult={submittingLabResult}
        form={labForm}
        formErrors={labFormErrors}
        onFormFieldChange={handleLabFormFieldChange}
        onSubmitLabResult={handleSubmitLabResult}
      />
    </div>
  );
}
