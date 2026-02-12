import { USER_ROLES, Case, ExtendedSession, User } from '@/types';
import { normalizeId } from '@/lib/utils/normalize';

type CaseRecord = Partial<Case> & { _id?: string; id?: string };

function mapCase(record: CaseRecord): Case {
  return {
    ...record,
    id: record._id || record.id || '',
  } as Case;
}

export async function getAllCases(): Promise<Case[]> {
  const res = await fetch('/api/cases');
  if (!res.ok) throw new Error('Failed to fetch cases');
  const responseData = await res.json();
  const data = responseData.data?.data || responseData.data || responseData;
  return Array.isArray(data) ? data.map((c) => mapCase(c as CaseRecord)) : [];
}

export async function getCaseById(id: string): Promise<Case | null> {
  const res = await fetch(`/api/cases/${id}`);
  if (!res.ok) return null;
  const responseData = await res.json();
  return normalizeId(responseData.data || responseData) as Case;
}

export async function createCase(caseData: Partial<Case>): Promise<Case> {
  const res = await fetch('/api/cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(caseData),
  });

  if (!res.ok) throw new Error('Failed to create case');
  const responseData = await res.json();
  return normalizeId(responseData.data || responseData) as Case;
}

export async function updateCase(id: string, caseData: Partial<Case>): Promise<Case | null> {
  const res = await fetch(`/api/cases/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(caseData),
  });

  if (!res.ok) return null;
  const responseData = await res.json();
  return normalizeId(responseData.data || responseData) as Case;
}

export async function deleteCase(id: string): Promise<boolean> {
  const res = await fetch(`/api/cases/${id}`, { method: 'DELETE' });
  return res.ok;
}

export function filterCasesByAccess(cases: Case[], user?: User | ExtendedSession['user']): Case[] {
  if (!Array.isArray(cases)) return [];
  if (!user) return cases;

  const { role, facilityId, district } = user;

  if (role === USER_ROLES.ADMIN || role === USER_ROLES.NATIONAL_OFFICER) return cases;
  
  if (role === USER_ROLES.DISTRICT_OFFICER && district) {
    // Filter cases by district - need to match facility's district
    return cases.filter(c => c.district === district);
  }
  
  if ((role === USER_ROLES.HEALTH_WORKER || role === USER_ROLES.LAB_TECHNICIAN) && facilityId) {
    return cases.filter(c => c.facilityId === facilityId);
  }

  return [];
}

export function canAccessCase(targetCase: Case, user?: User | ExtendedSession['user']): boolean {
  if (!user) return true; // Default to true if no user provided, let server handle strict check

  const { role, facilityId, district } = user;

  if (role === USER_ROLES.ADMIN || role === USER_ROLES.NATIONAL_OFFICER) return true;
  if (role === USER_ROLES.DISTRICT_OFFICER && district) return true;
  if ((role === USER_ROLES.HEALTH_WORKER || role === USER_ROLES.LAB_TECHNICIAN) && facilityId) {
    return targetCase.facilityId === facilityId;
  }

  return false;
}

export function prepareNewCase(caseData: Partial<Case>, user?: User | ExtendedSession['user']): Case {
  const userId = user?.id || '';
  const facilityId = user?.facilityId || '';

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...caseData
  } as Case;
}
