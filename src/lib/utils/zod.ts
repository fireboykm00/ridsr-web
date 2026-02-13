import { ZodError, ZodIssue } from 'zod';

const FIELD_LABELS: Record<string, string> = {
  nationalId: 'National ID',
  workerId: 'Worker ID',
  firstName: 'First name',
  lastName: 'Last name',
  name: 'Full name',
  email: 'Email',
  phone: 'Phone number',
  password: 'Password',
  role: 'Role',
  district: 'District',
  facilityId: 'Facility',
  patientId: 'Patient',
  diseaseCode: 'Disease',
  onsetDate: 'Onset date',
  testType: 'Test type',
  testName: 'Test name',
  testDate: 'Test date',
  resultValue: 'Result value',
  interpretation: 'Interpretation',
};

function resolveFieldLabel(issue: ZodIssue): string {
  const fieldName = issue.path.length > 0 ? String(issue.path[issue.path.length - 1]) : 'field';
  return FIELD_LABELS[fieldName] || fieldName;
}

export function normalizeZodIssueMessage(issue: ZodIssue): string {
  const label = resolveFieldLabel(issue);
  const message = issue.message;

  if (/^Too big/i.test(message)) {
    const max = 'maximum' in issue && typeof issue.maximum === 'number' ? issue.maximum : undefined;
    return max ? `${label} must be at most ${max} characters.` : `${label} is too long.`;
  }

  if (/^Too small/i.test(message)) {
    const min = 'minimum' in issue && typeof issue.minimum === 'number' ? issue.minimum : undefined;
    return min ? `${label} must be at least ${min} characters.` : `${label} is too short.`;
  }

  if (message === 'Invalid email') {
    return 'Enter a valid email address.';
  }

  return message;
}

export function zodErrorToFieldMap(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'form';
    if (!fieldErrors[path]) {
      fieldErrors[path] = normalizeZodIssueMessage(issue);
    }
  }
  return fieldErrors;
}
