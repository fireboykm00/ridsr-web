import { z } from 'zod';

// Helper: accept both YYYY-MM-DD (from HTML date inputs) and full ISO datetime strings
const dateStringSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Invalid date format' }
);

// User schemas
export const createUserSchema = z.object({
  workerId: z.string().optional(),
  nationalId: z.string().min(5).max(20),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  role: z.enum(['admin', 'national_officer', 'district_officer', 'health_worker', 'lab_technician']),
  facilityId: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
});

export const updateUserSchema = z.object({
  workerId: z.string().optional(),
  nationalId: z.string().min(5).max(20).optional(),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  role: z.enum(['admin', 'national_officer', 'district_officer', 'health_worker', 'lab_technician']).optional(),
  facilityId: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Patient schemas
export const createPatientSchema = z.object({
  nationalId: z.string().min(5).max(20),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  dateOfBirth: dateStringSchema,
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().min(10),
  address: z.object({
    street: z.string().min(1),
    sector: z.string().min(1),
    district: z.string().min(1),
    province: z.string().min(1),
    country: z.string().default('Rwanda'),
  }).optional(),
  district: z.string().min(1),
  occupation: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().min(2),
    phone: z.string().min(10),
    relationship: z.string().min(2),
  }).optional(),
});

export const updatePatientSchema = createPatientSchema.partial();

// Case schemas
export const createCaseSchema = z.object({
  patientId: z.string().min(1),
  diseaseCode: z.string().min(1),
  symptoms: z.array(z.string()).min(1),
  onsetDate: dateStringSchema,
  facilityId: z.string().optional(), // Allow facilityId to be passed in the request
});

export const updateCaseSchema = z.object({
  diseaseCode: z.string().min(1).optional(),
  symptoms: z.array(z.string()).min(1).optional(),
  onsetDate: dateStringSchema.optional(),
  validationStatus: z.enum(['pending', 'validated', 'rejected']).optional(),
  status: z.enum(['suspected', 'confirmed', 'resolved', 'invalidated']).optional(),
  outcome: z.enum(['recovered', 'deceased', 'transferred', 'unknown']).optional(),
});

// Facility schemas
export const createFacilitySchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  type: z.enum(['health_center', 'hospital', 'clinic', 'dispensary', 'medical_center']),
  district: z.string().min(1),
  province: z.string().optional(),
  contactPerson: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
});

export const updateFacilitySchema = createFacilitySchema.partial();

// Query schemas
export const paginationSchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 100)),
});

export const searchSchema = z.object({
  q: z.string().min(1),
});
