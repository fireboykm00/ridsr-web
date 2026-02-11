import { auth } from '@/lib/auth';
import { USER_ROLES, Patient, RwandaDistrictType } from '@/types';

export async function getAllPatients(): Promise<Patient[]> {
  const res = await fetch('/api/patients');
  if (!res.ok) throw new Error('Failed to fetch patients');
  return res.json();
}

export async function getPatientById(id: string): Promise<Patient | null> {
  const res = await fetch(`/api/patients/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createPatient(patientData: Partial<Patient>): Promise<Patient> {
  const session = await auth();
  if (!session?.user) throw new Error('User not authenticated');

  const res = await fetch('/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData),
  });

  if (!res.ok) throw new Error('Failed to create patient');
  return res.json();
}

export async function updatePatient(id: string, patientData: Partial<Patient>): Promise<Patient | null> {
  const session = await auth();
  if (!session?.user) throw new Error('User not authenticated');

  const res = await fetch(`/api/patients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData),
  });

  if (!res.ok) return null;
  return res.json();
}

export async function deletePatient(id: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== USER_ROLES.ADMIN) {
    throw new Error('Only administrators can delete patients');
  }

  const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function filterPatientsByAccess(patients: Patient[]): Promise<Patient[]> {
  const session = await auth();
  if (!session?.user) return [];

  const { role } = session.user;

  if (role === USER_ROLES.ADMIN || role === USER_ROLES.NATIONAL_OFFICER) return patients;
  if (role === USER_ROLES.DISTRICT_OFFICER) return patients;
  if (role === USER_ROLES.HEALTH_WORKER || role === USER_ROLES.LAB_TECHNICIAN) return patients;

  return [];
}

export async function canAccessPatient(targetPatient: Patient): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const { role } = session.user;

  if (role === USER_ROLES.ADMIN || role === USER_ROLES.NATIONAL_OFFICER) return true;
  if (role === USER_ROLES.DISTRICT_OFFICER) return true;
  if (role === USER_ROLES.HEALTH_WORKER || role === USER_ROLES.LAB_TECHNICIAN) return true;

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
    dateOfBirth: patientData.dateOfBirth || new Date().toISOString(),
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
  } as Patient;
}
