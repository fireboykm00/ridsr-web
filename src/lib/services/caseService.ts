import { auth } from '@/lib/auth';
import { USER_ROLES, Case } from '@/types';

export async function getAllCases(): Promise<Case[]> {
  const res = await fetch('/api/cases');
  if (!res.ok) throw new Error('Failed to fetch cases');
  return res.json();
}

export async function getCaseById(id: string): Promise<Case | null> {
  const res = await fetch(`/api/cases/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createCase(caseData: Partial<Case>): Promise<Case> {
  const session = await auth();
  if (!session?.user) throw new Error('User not authenticated');

  const res = await fetch('/api/cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...caseData,
      facilityId: session.user.facilityId,
      reporterId: session.user.id,
    }),
  });

  if (!res.ok) throw new Error('Failed to create case');
  return res.json();
}

export async function updateCase(id: string, caseData: Partial<Case>): Promise<Case | null> {
  const session = await auth();
  if (!session?.user) throw new Error('User not authenticated');

  const res = await fetch(`/api/cases/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(caseData),
  });

  if (!res.ok) return null;
  return res.json();
}

export async function deleteCase(id: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== USER_ROLES.ADMIN) {
    throw new Error('Only administrators can delete cases');
  }

  const res = await fetch(`/api/cases/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function filterCasesByAccess(cases: Case[]): Promise<Case[]> {
  const session = await auth();
  if (!session?.user) return [];

  const { role, facilityId, district } = session.user;

  if (role === USER_ROLES.ADMIN || role === USER_ROLES.NATIONAL_OFFICER) return cases;
  if (role === USER_ROLES.DISTRICT_OFFICER && district) return cases;
  if ((role === USER_ROLES.HEALTH_WORKER || role === USER_ROLES.LAB_TECHNICIAN) && facilityId) {
    return cases.filter(c => c.facilityId === facilityId);
  }

  return [];
}

export async function canAccessCase(targetCase: Case): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const { role, facilityId, district } = session.user;

  if (role === USER_ROLES.ADMIN || role === USER_ROLES.NATIONAL_OFFICER) return true;
  if (role === USER_ROLES.DISTRICT_OFFICER && district) return true;
  if ((role === USER_ROLES.HEALTH_WORKER || role === USER_ROLES.LAB_TECHNICIAN) && facilityId) {
    return targetCase.facilityId === facilityId;
  }

  return false;
}

export async function prepareNewCase(caseData: Partial<Case>): Promise<Case> {
  const session = await auth();
  if (!session?.user) throw new Error('User not authenticated');

  const { id: userId, facilityId } = session.user;

  return {
    id: `case_${Date.now()}`,
    patientId: caseData.patientId || '',
    facilityId: facilityId || '',
    diseaseCode: caseData.diseaseCode || '',
    symptoms: caseData.symptoms || [],
    onsetDate: caseData.onsetDate || new Date().toISOString(),
    reportDate: new Date().toISOString(),
    reporterId: userId || '',
    validationStatus: 'pending',
    isAlertTriggered: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...caseData
  } as Case;
}
