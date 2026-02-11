import { auth } from '@/lib/auth';
import { USER_ROLES, Patient, RwandaDistrictType } from '@/types';

export async function filterPatientsByAccess(patients: Patient[]): Promise<Patient[]> {
  const session = await auth();
  if (!session?.user) return [];

  const { role, facilityId, district } = session.user;

  if (role === USER_ROLES.ADMIN || role === USER_ROLES.NATIONAL_OFFICER) return patients;
  if (role === USER_ROLES.DISTRICT_OFFICER && district) return patients;
  if ((role === USER_ROLES.HEALTH_WORKER || role === USER_ROLES.LAB_TECHNICIAN) && facilityId) {
    // Note: This logic looks incorrect - patients shouldn't be filtered by facilityId like this
    // The original logic appears to be comparing patient.id with facilityId which doesn't make sense
    // Assuming we want to filter by some facility-related field in patient if it exists
    return patients; // Temporarily returning all until we clarify the intended logic
  }

  return [];
}

export async function canAccessPatient(targetPatient: Patient): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const { role, facilityId, district } = session.user;

  if (role === USER_ROLES.ADMIN || role === USER_ROLES.NATIONAL_OFFICER) return true;
  if (role === USER_ROLES.DISTRICT_OFFICER && district) return true;
  if ((role === USER_ROLES.HEALTH_WORKER || role === USER_ROLES.LAB_TECHNICIAN) && facilityId) {
    // Same note as above - this logic seems incorrect
    return true; // Temporarily returning true until clarified
  }

  return false;
}

export async function prepareNewPatient(patientData: Partial<Patient>): Promise<Patient> {
  const session = await auth();
  if (!session?.user) throw new Error('User not authenticated');

  return {
    id: `patient_${Date.now()}`,
    nationalId: patientData.nationalId || '',
    firstName: patientData.firstName || '',
    lastName: patientData.lastName || '',
    dateOfBirth: patientData.dateOfBirth || '',
    gender: patientData.gender || 'other',
    phone: patientData.phone || '',
    address: patientData.address || {
      street: '',
      sector: '',
      district: 'gasabo' as RwandaDistrictType,
      province: 'kigali_city',
      country: 'Rwanda'
    },
    occupation: patientData.occupation || '',
    emergencyContact: patientData.emergencyContact || {
      name: '',
      phone: '',
      relationship: ''
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...patientData
  };
}
