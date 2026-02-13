import { z } from 'zod';

// Helper: accept both YYYY-MM-DD (from HTML date inputs) and full ISO datetime strings
const dateStringSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Enter a valid date.' }
);

const requiredString = (label: string) =>
  z.string().trim().min(1, `${label} is required.`);

// User schemas
export const createUserSchema = z.object({
  workerId: z.string().optional(),
  nationalId: requiredString('National ID')
    .min(5, 'National ID must be at least 5 characters.')
    .max(20, 'National ID must be at most 20 characters.'),
  name: requiredString('Full name').min(2, 'Full name must be at least 2 characters.'),
  email: requiredString('Email').email('Enter a valid email address.'),
  phone: requiredString('Phone number').min(10, 'Phone number must be at least 10 digits.'),
  password: requiredString('Password').min(6, 'Password must be at least 6 characters.'),
  role: z.enum(['admin', 'national_officer', 'district_officer', 'health_worker', 'lab_technician'], {
    message: 'Role is required.',
  }),
  facilityId: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
});

export const updateUserSchema = z.object({
  workerId: z.string().optional(),
  nationalId: z.string().trim().min(5, 'National ID must be at least 5 characters.').max(20, 'National ID must be at most 20 characters.').optional(),
  name: z.string().trim().min(2, 'Full name must be at least 2 characters.').optional(),
  email: z.string().trim().email('Enter a valid email address.').optional(),
  phone: z.string().trim().min(10, 'Phone number must be at least 10 digits.').optional(),
  role: z.enum(['admin', 'national_officer', 'district_officer', 'health_worker', 'lab_technician'], {
    message: 'Role is required.',
  }).optional(),
  facilityId: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Patient schemas
export const createPatientSchema = z.object({
  nationalId: requiredString('National ID')
    .min(5, 'National ID must be at least 5 characters.')
    .max(20, 'National ID must be at most 20 characters.'),
  firstName: requiredString('First name').min(2, 'First name must be at least 2 characters.'),
  lastName: requiredString('Last name').min(2, 'Last name must be at least 2 characters.'),
  dateOfBirth: dateStringSchema,
  gender: z.enum(['male', 'female', 'other'], { message: 'Gender is required.' }),
  phone: requiredString('Phone number').min(10, 'Phone number must be at least 10 digits.'),
  address: z.object({
    street: requiredString('Street'),
    sector: requiredString('Sector'),
    district: requiredString('District'),
    province: requiredString('Province'),
    country: z.string().default('Rwanda'),
  }).optional(),
  district: requiredString('District'),
  occupation: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().trim().min(2, 'Emergency contact name must be at least 2 characters.'),
    phone: z.string().trim().min(10, 'Emergency contact phone must be at least 10 digits.'),
    relationship: z.string().trim().min(2, 'Relationship must be at least 2 characters.'),
  }).optional(),
});

export const updatePatientSchema = createPatientSchema.partial();

// Case schemas
export const createCaseSchema = z.object({
  patientId: requiredString('Patient'),
  diseaseCode: requiredString('Disease'),
  symptoms: z.array(z.string()).min(1, 'Select at least one symptom.'),
  onsetDate: dateStringSchema,
  facilityId: z.string().optional(), // Allow facilityId to be passed in the request
});

export const updateCaseSchema = z.object({
  diseaseCode: z.string().trim().min(1, 'Disease is required.').optional(),
  symptoms: z.array(z.string()).min(1, 'Select at least one symptom.').optional(),
  onsetDate: dateStringSchema.optional(),
  validationStatus: z.enum(['pending', 'validated', 'rejected']).optional(),
  status: z.enum(['suspected', 'confirmed', 'resolved', 'invalidated']).optional(),
  outcome: z.enum(['recovered', 'deceased', 'transferred', 'unknown']).optional(),
});

// Facility schemas
export const createFacilitySchema = z.object({
  name: requiredString('Facility name').min(2, 'Facility name must be at least 2 characters.'),
  code: requiredString('Facility code').min(2, 'Facility code must be at least 2 characters.'),
  type: z.enum(['health_center', 'hospital', 'clinic', 'dispensary', 'medical_center'], {
    message: 'Facility type is required.',
  }),
  district: requiredString('District'),
  province: z.string().optional(),
  contactPerson: requiredString('Contact person').min(2, 'Contact person must be at least 2 characters.'),
  phone: requiredString('Phone number').min(10, 'Phone number must be at least 10 digits.'),
  email: requiredString('Email').email('Enter a valid email address.'),
});

export const updateFacilitySchema = createFacilitySchema.partial();

// Query schemas
export const paginationSchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 100)),
});

export const searchSchema = z.object({
  q: z.string().trim().min(1, 'Search term is required.'),
});
