import { z } from 'zod';

export const createUserSchema = z.object({
  workerId: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'NATIONAL_OFFICER', 'DISTRICT_OFFICER', 'HEALTH_WORKER', 'LAB_TECHNICIAN']),
  facilityId: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'NATIONAL_OFFICER', 'DISTRICT_OFFICER', 'HEALTH_WORKER', 'LAB_TECHNICIAN']).optional(),
  facilityId: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const createFacilitySchema = z.object({
  name: z.string().min(2),
  type: z.enum(['HOSPITAL', 'CLINIC', 'HEALTH_CENTER', 'LAB']),
  district: z.string().min(1),
  province: z.string().min(1),
  contactPerson: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

export const createPatientSchema = z.object({
  nationalId: z.string().min(16).max(16),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  address: z.object({
    street: z.string(),
    sector: z.string(),
    district: z.string(),
    province: z.string(),
    country: z.string(),
  }).optional(),
});

export const createCaseSchema = z.object({
  patientId: z.string().min(1),
  diseaseCode: z.string().min(1),
  symptoms: z.array(z.string()).optional(),
  onsetDate: z.string().datetime(),
  labResults: z.string().optional(),
});

export const createAlertSchema = z.object({
  diseaseCode: z.string().min(1),
  location: z.string().min(1),
  caseCount: z.number().min(1),
  threshold: z.number().min(1),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
});
