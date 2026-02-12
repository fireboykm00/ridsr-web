import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCases, createCase } from '@/lib/services/server/caseService';
import { createCaseSchema, paginationSchema } from '@/lib/schemas';
import { successResponse, errorResponse } from '@/lib/api/response';
import { isAuthError, requireAuth } from '@/lib/api/middleware';
import { CaseStatus, DiseaseCode, Symptom } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    });

    const filters = {
      facilityId: searchParams.get('facilityId') || user?.facilityId,
      status: (searchParams.get('status') as CaseStatus) || undefined,
      district: searchParams.get('district') || undefined,
    };

    const result = await getCases(filters, page, limit);
    return successResponse(result);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid query parameters', 400, error.issues[0].message);
    }
    console.error('[API] Error fetching cases:', error);
    return errorResponse('Failed to fetch cases');
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const body = await request.json();
    const validated = createCaseSchema.parse(body);

    // If facilityId is a code (not ObjectId), look it up
    let facilityId = body.facilityId || user?.facilityId;
    if (facilityId && facilityId.length < 24) {
      // It's a code, need to look up the facility
      const { facilityService } = await import('@/lib/services/server/facilityService');
      const facility = await facilityService.getFacilityByCode(facilityId);
      if (!facility) {
        return errorResponse('Facility not found', 404);
      }
      facilityId = facility._id?.toString();
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
    if (error instanceof z.ZodError) {
      return errorResponse('Validation failed', 400, error.issues[0].message);
    }
    console.error('[API] Error creating case:', error);
    return errorResponse('Failed to create case');
  }
}
