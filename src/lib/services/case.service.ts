import { auth } from '@/lib/auth';
import { USER_ROLES, Case } from '@/types';

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
    facilityId: facilityId,
    diseaseCode: caseData.diseaseCode || '',
    symptoms: caseData.symptoms || [],
    onsetDate: caseData.onsetDate || new Date().toISOString(),
    reportDate: new Date().toISOString(),
    reporterId: userId,
    validationStatus: 'pending',
    isAlertTriggered: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...caseData
  };
}
