import { USER_ROLES, Patient, RwandaDistrictType, User, ExtendedSession } from '@/types';
import { normalizeId, normalizeIds } from '@/lib/utils/normalize';
import { throwApiError } from '@/lib/utils/apiError';

export async function getAllPatients(): Promise<Patient[]> {
  const res = await fetch('/api/patients');
  if (!res.ok) await throwApiError(res, 'Failed to fetch patients');
  const responseData = await res.json();
  const data = responseData.data || responseData;
  return normalizeIds(Array.isArray(data) ? data : []);
}

export async function getPatientById(id: string): Promise<Patient | null> {
  if (!id || id === 'undefined') return null;
  
  const res = await fetch(`/api/patients/${id}`);
  if (!res.ok) return null;
  const responseData = await res.json();
  return normalizeId(responseData.data || responseData);
}

export async function createPatient(patientData: Partial<Patient>): Promise<Patient> {
  const res = await fetch('/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData),
  });

  if (!res.ok) await throwApiError(res, 'Failed to create patient');
  const responseData = await res.json();
  return normalizeId(responseData.data || responseData);
}

export async function updatePatient(id: string, patientData: Partial<Patient>): Promise<Patient | null> {
  const res = await fetch(`/api/patients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData),
  });

  if (!res.ok) await throwApiError(res, 'Failed to update patient');
  const responseData = await res.json();
  return normalizeId(responseData.data || responseData);
}

export async function deletePatient(id: string): Promise<boolean> {
  const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
  if (!res.ok) await throwApiError(res, 'Failed to delete patient');
  return res.ok;
}

export async function searchPatients(query: string): Promise<Patient[]> {
  const res = await fetch(`/api/patients?q=${encodeURIComponent(query)}`);
  if (!res.ok) await throwApiError(res, 'Failed to search patients');
  const responseData = await res.json();
  const data = responseData.data || responseData;
  return normalizeIds(Array.isArray(data) ? data : []);
}

export async function getPatientsWithFilters(filters: {
  search?: string;
  district?: string;
  gender?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: Patient[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.district) params.append('district', filters.district);
  if (filters.gender) params.append('gender', filters.gender);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const res = await fetch(`/api/patients?${params}`);
  if (!res.ok) await throwApiError(res, 'Failed to fetch patients');
  return res.json();
}

export function filterPatientsByAccess(patients: Patient[], user?: User | ExtendedSession['user']): Patient[] {
  if (!Array.isArray(patients)) return [];
  if (!user) return patients;

  const { role } = user;

  if (role === USER_ROLES.ADMIN || role === USER_ROLES.NATIONAL_OFFICER) return patients;
  if (role === USER_ROLES.DISTRICT_OFFICER) return patients;
  if (role === USER_ROLES.HEALTH_WORKER || role === USER_ROLES.LAB_TECHNICIAN) return patients;

  return [];
}

export function canAccessPatient(targetPatient: Patient, user?: User | ExtendedSession['user']): boolean {
  if (!user) return true;

  const { role } = user;

  if (role === USER_ROLES.ADMIN || role === USER_ROLES.NATIONAL_OFFICER) return true;
  if (role === USER_ROLES.DISTRICT_OFFICER) return true;
  if (role === USER_ROLES.HEALTH_WORKER || role === USER_ROLES.LAB_TECHNICIAN) return true;

  return false;
}

export function prepareNewPatient(patientData: Partial<Patient>): Patient {
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
    district: patientData.district || 'gasabo' as RwandaDistrictType,
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
