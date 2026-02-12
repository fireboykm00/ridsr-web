import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getPatients, createPatient, searchPatients } from '@/lib/services/server/patientService';
import { createPatientSchema, searchSchema } from '@/lib/schemas';
import { successResponse, errorResponse } from '@/lib/api/response';
import { isAuthError, requireAuth } from '@/lib/api/middleware';
import { RwandaDistrictType, RwandaProvinceType, Gender } from '@/types';
import type { CreatePatientData } from '@/lib/services/server/patientService';

const filtersSchema = z.object({
  district: z.string().optional(),
  gender: z.string().optional(),
  search: z.string().optional(),
  page: z.string().default('1'),
  limit: z.string().default('10'),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (query) {
      const { q } = searchSchema.parse({ q: query });
      const patients = await searchPatients(q);
      return successResponse(patients);
    } else {
      const filters = filtersSchema.parse({
        district: searchParams.get('district') || undefined,
        gender: searchParams.get('gender') || undefined,
        search: searchParams.get('search') || undefined,
        page: searchParams.get('page') || '1',
        limit: searchParams.get('limit') || '10',
      });

      const patientFilters = {
        district: (filters.district || user?.district) as RwandaDistrictType,
        gender: filters.gender as Gender,
        search: filters.search,
      };

      const result = await getPatients(patientFilters, parseInt(filters.page), parseInt(filters.limit));
      return successResponse(result);
    }
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid query parameters', 400, error.issues[0].message);
    }
    console.error('[API] Error fetching patients:', error);
    return errorResponse('Failed to fetch patients');
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    const body = await request.json();
    const validated = createPatientSchema.parse(body);

    const patientData: CreatePatientData = {
      ...validated,
      dateOfBirth: new Date(validated.dateOfBirth),
      gender: validated.gender as Gender,
      district: validated.district as RwandaDistrictType,
      address: validated.address ? {
        ...validated.address,
        district: validated.address.district as RwandaDistrictType,
        province: validated.address.province as RwandaProvinceType,
      } : undefined,
    };

    const patient = await createPatient(patientData);
    return successResponse(patient, 201);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    if (error instanceof z.ZodError) {
      return errorResponse('Validation failed', 400, error.issues[0].message);
    }
    console.error('[API] Error creating patient:', error);
    return errorResponse('Failed to create patient');
  }
}
