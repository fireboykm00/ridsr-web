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
  // Kigali City
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

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

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
  name: string;
  email: string;
  role: UserRole;
  facilityId: string;
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
  address: {
    street: string;
    sector: string;
    district: RwandaDistrictType;
    province: RwandaProvinceType;
    country: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
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
  address: {
    street: string;
    sector: string;
    district: RwandaDistrictType;
    province: RwandaProvinceType;
    country: string;
  };
  occupation: string;
  emergencyContact: {
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
  diseaseCode: string;
  symptoms: string[];
  onsetDate: string;
  reportDate: string;
  reporterId: string;
  validationStatus: ValidationStatus;
  validatorId?: string;
  validationDate?: string;
  outcome?: OutcomeStatus;
  outcomeDate?: string;
  labResults?: string[];
  isAlertTriggered: boolean;
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

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  caseId?: string;
  facilityId?: string;
  district: RwandaDistrictType;
  triggerDate: string;
  resolvedDate?: string;
  resolvedBy?: string;
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
}


/* ======================================================
   DASHBOARD TYPES
====================================================== */

export interface DashboardStats {
  totalCases: number;
  pendingCases: number;
  confirmedCases: number;
  resolvedCases: number;
  totalFacilities: number;
  totalUsers: number;
  activeOutbreaks: number;
  weeklyTrends?: Array<{ week: string; count: number }>;
  diseaseDistribution?: Array<{ disease: string; count: number }>;
  facilityCaseDistribution?: Array<{ facility: string; cases: number }>;
  districtCaseDistribution?: Array<{ district: string; cases: number }>;
  geographicDistribution?: Array<{ region: string; cases: number }>;
  caseStatusBreakdown?: Array<{ status: string; count: number }>;
}


/* ======================================================
   INPUT DTOs
====================================================== */

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  facilityId?: string;
  district?: RwandaDistrictType;
  province?: RwandaProvinceType;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
  facilityId?: string;
  district?: RwandaDistrictType;
  province?: RwandaProvinceType;
}

export interface CreateFacilityInput {
  name: string;
  code: string;
  type: FacilityType;
  district: RwandaDistrictType;
  province: RwandaProvinceType;
  address: {
    street: string;
    sector: string;
    district: RwandaDistrictType;
    province: RwandaProvinceType;
    country: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface UpdateFacilityInput {
  name?: string;
  code?: string;
  type?: FacilityType;
  district?: RwandaDistrictType;
  province?: RwandaProvinceType;
  address?: {
    street?: string;
    sector?: string;
    district?: RwandaDistrictType;
    province?: RwandaProvinceType;
    country?: string;
  };
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
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
    district?: RwandaDistrictType;
    province?: RwandaProvinceType;
  };
  expires: string;
}


/* ======================================================
   NAVIGATION
====================================================== */

export interface ThresholdRule {
  id: string;
  diseaseCode: string;
  threshold: number;
  timeWindowHours: number;
  locationLevel: 'national' | 'province' | 'district' | 'facility';
  locationId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
  badge?: number;
  disabled?: boolean;
}
