/**
 * Form Data Transfer Objects (DTOs)
 * Centralized types for all form submissions
 * Source of truth for form data structures
 */

import { UserRole, RwandaDistrictType, RwandaProvinceType, FacilityType, Gender, ValidationStatus, OutcomeStatus, CaseStatus } from './index';

/* ======================================================
   CASE REPORT FORM
====================================================== */

export interface CaseReportFormData {
  patientId: string;
  diseaseCode: string;
  onsetDate: string;
  symptoms: string[];
  facilityId?: string;
}

export interface CreateCaseInput {
  patientId: string;
  diseaseCode: string;
  symptoms: string[];
  onsetDate: string;
}

export interface UpdateCaseInput {
  diseaseCode?: string;
  symptoms?: string[];
  onsetDate?: string;
  validationStatus?: ValidationStatus;
  status?: CaseStatus;
  outcome?: OutcomeStatus;
}

/* ======================================================
   PATIENT MANAGEMENT FORM
====================================================== */

export interface PatientFormData {
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
    street?: string;
    sector?: string;
    district?: RwandaDistrictType;
    province?: RwandaProvinceType;
    country?: string;
  };
  district?: RwandaDistrictType;
  occupation?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}

/* ======================================================
   USER MANAGEMENT FORM
====================================================== */

export interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  facilityId?: string;
  district?: RwandaDistrictType;
  password?: string;
  workerId?: string;
}

export interface CreateUserInput {
  workerId: string;
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
  isActive?: boolean;
}

/* ======================================================
   FACILITY MANAGEMENT FORM
====================================================== */

export interface FacilityFormData {
  name: string;
  code: string;
  type: FacilityType;
  district: RwandaDistrictType;
  contactPerson: string;
  phone: string;
  email: string;
}

export interface CreateFacilityInput {
  name: string;
  code: string;
  type: FacilityType;
  district: RwandaDistrictType;
  contactPerson: string;
  phone: string;
  email: string;
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
   REPORT FILTER FORM
====================================================== */

export interface ReportFilterFormData {
  startDate?: string;
  endDate?: string;
  diseaseCode?: string;
  district?: RwandaDistrictType;
  status?: string;
}
