// =======================================================
// RIDSR Platform - Centralized Type Definitions
// Enterprise-grade, strict, modular typing
// =======================================================

/* ======================================================
   ROLE DEFINITIONS
====================================================== */

export const USER_ROLES = {
  ADMIN: 'admin',
  NATIONAL_OFFICER: 'national_officer',
  DISTRICT_OFFICER: 'district_officer',
  HEALTH_WORKER: 'health_worker',
  LAB_TECHNICIAN: 'lab_technician',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];


/* ======================================================
   RWANDA ADMINISTRATIVE DIVISIONS
====================================================== */

export const RWANDA_PROVINCES = {
  KIGALI: 'kigali_city',
  NORTHERN: 'northern_province',
  SOUTHERN: 'southern_province',
  EASTERN: 'eastern_province',
  WESTERN: 'western_province',
} as const;

export type RwandaProvinceType =
  typeof RWANDA_PROVINCES[keyof typeof RWANDA_PROVINCES];

export const RWANDA_DISTRICTS = {
  // City of Kigali
  GASABO: 'gasabo',
  KICUKIRO: 'kicukiro',
  NYARUGENGE: 'nyarugenge',

  // Northern Province
  BURERA: 'burera',
  GAKENKE: 'gakenke',
  GICUMBI: 'gicumbi',
  MUSANZE: 'musanze',
  RULINDO: 'rulindo',

  // Southern Province
  GISAGARA: 'gisagara',
  HUYE: 'huye',
  KAMONYI: 'kamonyi',
  MUHANGA: 'muhanga',
  NYAMAGABE: 'nyamagabe',
  NYANZA: 'nyanza',
  NYARUGURU: 'nyaruguru',
  RUHANGO: 'ruhango',

  // Eastern Province
  BUGESERA: 'bugesera',
  GATSIBO: 'gatsibo',
  KAYONZA: 'kayonza',
  KIREHE: 'kirehe',
  NGOMA: 'ngoma',
  NYAGATARE: 'nyagatare',
  RWAMAGANA: 'rwamagana',

  // Western Province
  KARONGI: 'karongi',
  NGORORERO: 'ngororero',
  NYABIHU: 'nyabihu',
  NYAMASHEKE: 'nyamasheke',
  RUBAVU: 'rubavu',
  RUSIZI: 'rusizi',
  RUTSIRO: 'rutsiro',
} as const;

export type RwandaDistrictType =
  typeof RWANDA_DISTRICTS[keyof typeof RWANDA_DISTRICTS];


/* ======================================================
   STATUS & ENUM TYPES
====================================================== */

export type CaseStatus = 'suspected' | 'confirmed' | 'resolved' | 'invalidated';
export type ValidationStatus = 'pending' | 'validated' | 'rejected';
export type OutcomeStatus = 'recovered' | 'deceased' | 'transferred' | 'unknown';
export type Gender = 'male' | 'female' | 'other';


export type ReportType =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annual'
  | 'custom';

export type ReportStatus =
  | 'draft'
  | 'generated'
  | 'distributed'
  | 'scheduled';

export type LabResultInterpretation =
  | 'positive'
  | 'negative'
  | 'equivocal'
  | 'contaminated';

export type PriorityLevel = 'low' | 'normal' | 'high' | 'urgent';

export type DiseaseCode =
  | 'CHOLERA'
  | 'MAL01'
  | 'SARI'
  | 'AFP'
  | 'YELLOW_FEVER'
  | 'RUBELLA'
  | 'MEASLES'
  | 'PLAGUE'
  | 'RABIES'
  | 'EBOLA'
  | 'MONKEYPOX'
  | 'TYPHOID'
  | 'HEPATITIS_E';

export type Symptom =
  | 'fever'
  | 'cough'
  | 'difficulty_breathing'
  | 'diarrhea'
  | 'vomiting'
  | 'headache'
  | 'muscle_pain'
  | 'fatigue'
  | 'rash'
  | 'jaundice'
  | 'bleeding'
  | 'convulsions'
  | 'paralysis'
  | 'sore_throat'
  | 'abdominal_pain'
  | 'joint_pain'
  | 'loss_of_appetite'
  | 'dehydration'
  | 'confusion'
  | 'seizures';

export type FacilityType =
  | 'health_center'
  | 'hospital'
  | 'clinic'
  | 'dispensary'
  | 'medical_center';

export type BulletinType = 'weekly' | 'monthly' | 'outbreak' | 'special';
export type BulletinStatus =
  | 'draft'
  | 'generated'
  | 'distributed'
  | 'scheduled';


/* ======================================================
   CORE DOMAIN ENTITIES
====================================================== */

export interface User {
  id: string;
  workerId: string;
  nationalId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  facilityId: string;
  facilityName?: string;
  district?: RwandaDistrictType;
  province?: RwandaProvinceType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Facility {
  id: string;
  name: string;
  code: string;
  type: FacilityType;
  district: RwandaDistrictType;
  province: RwandaProvinceType;
  contactPerson?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  address?: {
    street: string;
    sector: string;
    district: RwandaDistrictType;
    province: RwandaProvinceType;
    country: string;
  };
  district: RwandaDistrictType;
  occupation?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Case {
  id: string;
  patientId: string;
  facilityId: string;
  diseaseCode: DiseaseCode;
  symptoms: Symptom[];
  onsetDate: string;
  reportDate: string;
  reporterId: string;
  validationStatus: ValidationStatus;
  status: CaseStatus;
  outcome?: OutcomeStatus;
  validatorId?: string;
  validationDate?: string;
  outcomeDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LabResult {
  id: string;
  caseId: string;
  facilityId: string;
  testType: string;
  testName: string;
  testDate: string;
  resultValue: string;
  resultUnit?: string;
  referenceRange?: string;
  interpretation: LabResultInterpretation;
  technicianId: string;
  validatedBy?: string;
  validatedAt?: string;
  createdAt: string;
  updatedAt: string;
}


export interface Report {
  id: string;
  title: string;
  type: ReportType;
  status: ReportStatus;
  content: string;
  generatedBy: string;
  generatedAt: string;
  recipients: number;
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bulletin {
  id: string;
  title: string;
  description: string;
  date: string;
  type: BulletinType;
  status: BulletinStatus;
  recipients: number;
  createdAt: string;
  updatedAt: string;
}


/* ======================================================
   DASHBOARD TYPES
====================================================== */

export interface DashboardStats {
  totalCases: number;
  pendingCases: number;
  validatedCases: number;
  rejectedCases: number;
  totalFacilities: number;
  totalUsers: number;
  activeOutbreaks: number;
  alerts: number;
}


/* ======================================================
   INPUT DTOs
====================================================== */

export interface CreateUserInput {
  workerId?: string;
  nationalId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  facilityId?: string;
  facilityName?: string;
  district?: RwandaDistrictType;
  province?: RwandaProvinceType;
}

export interface UpdateUserInput {
  workerId?: string;
  nationalId?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  facilityId?: string;
  facilityName?: string;
  district?: RwandaDistrictType;
  province?: RwandaProvinceType;
  isActive?: boolean;
}

export interface CreatePatientInput {
  nationalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  address?: {
    street: string;
    sector: string;
    district: RwandaDistrictType;
    province: RwandaProvinceType;
    country: string;
  };
  district: RwandaDistrictType;
  occupation?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface UpdatePatientInput {
  nationalId?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  phone?: string;
  address?: {
    street: string;
    sector: string;
    district: RwandaDistrictType;
    province: RwandaProvinceType;
    country: string;
  };
  district?: RwandaDistrictType;
  occupation?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}

export interface CreateFacilityInput {
  name: string;
  code: string;
  type: FacilityType;
  district: RwandaDistrictType;
  province: RwandaProvinceType;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

export interface UpdateFacilityInput {
  name?: string;
  code?: string;
  type?: FacilityType;
  district?: RwandaDistrictType;
  province?: RwandaProvinceType;
  contactPerson?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}


/* ======================================================
   API TYPES
====================================================== */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiErrorResponse {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}


/* ======================================================
   SESSION
====================================================== */

export interface ExtendedSession {
  user: {
    id: string;
    workerId: string;
    name: string;
    email: string;
    role: UserRole;
    facilityId: string;
    facilityName?: string;
    district?: RwandaDistrictType;
    province?: RwandaProvinceType;
  };
  expires: string;
}


/* ======================================================
   NAVIGATION
====================================================== */


export interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
  badge?: number;
  disabled?: boolean;
}
