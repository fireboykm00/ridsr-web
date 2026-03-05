import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCases, createCase } from '@/lib/services/server/caseService';
import { createCaseSchema, paginationSchema } from '@/lib/schemas';
import { successResponse, errorResponse } from '@/lib/api/response';
import {
  serverErrorResponse,
  validationErrorResponse,
  parseAndValidateBody,
  isApiValidationError,
  apiValidationErrorResponse,
} from '@/lib/api/error-utils';
import { isAuthError, requireAuth } from '@/lib/api/middleware';
import { CaseStatus, DiseaseCode, Symptom, ValidationStatus } from '@/types';

const getCasesQuerySchema = z.object({
  facilityId: z.string().optional(),
  patientId: z.string().optional(),
  district: z.string().optional(),
  status: z.enum(['suspected', 'confirmed', 'resolved', 'invalidated']).optional(),
  validationStatus: z.enum(['pending', 'validated', 'rejected']).optional(),
  diseaseCode: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
}).merge(paginationSchema.partial());

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const {
      facilityId,
      patientId,
      district,
      status,
      validationStatus,
      diseaseCode,
      search,
      dateFrom,
      dateTo,
      page,
      limit,
    } = getCasesQuerySchema.parse(queryParams);

    const filters = {
      facilityId: facilityId || user?.facilityId,
      patientId: patientId || undefined,
      district: district || undefined,
      status: status as CaseStatus | undefined,
      validationStatus: validationStatus as ValidationStatus | undefined,
      diseaseCode: diseaseCode as DiseaseCode | undefined,
      search: search || undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    };

    const result = await getCases(filters, page ?? 1, limit ?? 10);
    return successResponse(result);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error, 'Invalid query parameters');
    }
    console.error('[API] Error fetching cases:', error);
    return serverErrorResponse(error, 'Failed to fetch cases', 'CASE_FETCH_FAILED');
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const validated = await parseAndValidateBody(request, createCaseSchema, {
      message: 'Please correct the highlighted case fields.',
    });

    // If facilityId is a code (not ObjectId), look it up
    let facilityId = validated.facilityId || user?.facilityId;
    if (facilityId && facilityId.length < 24) {
      // It's a code, need to look up the facility
      const { facilityService } = await import('@/lib/services/server/facilityService');
      const facility = await facilityService.getFacilityByCode(facilityId);
      if (!facility) {
        return errorResponse('Facility not found', 404);
      }
      facilityId = facility._id?.toString();
    }
    if (!facilityId) {
      return errorResponse('Facility is required', 400);
    }

    const caseRecord = await createCase({
      ...validated,
      diseaseCode: validated.diseaseCode as DiseaseCode,
      symptoms: validated.symptoms as Symptom[],
      onsetDate: new Date(validated.onsetDate),
      facilityId,
      reporterId: user?.id || 'anonymous',
    });

    const responseData = {
      ...((typeof caseRecord.toJSON === 'function') ? caseRecord.toJSON() : caseRecord),
      id: caseRecord._id?.toString(),
    };

    return successResponse(responseData, 201);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    if (isApiValidationError(error)) {
      return apiValidationErrorResponse(error);
    }
    console.error('[API] Error creating case:', error);
    return serverErrorResponse(error, 'Failed to create case', 'CASE_CREATE_FAILED');
  }
}
