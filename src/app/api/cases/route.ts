import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getCases, createCase } from '@/lib/services/server/caseService';
import { createCaseSchema, paginationSchema } from '@/lib/schemas';
import { successResponse, errorResponse } from '@/lib/api/response';
import { DiseaseCode, CaseStatus } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

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
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid query parameters', 400, error.issues[0].message);
    }
    console.error('[API] Error fetching cases:', error);
    return errorResponse('Failed to fetch cases');
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

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
      facilityId = (facility as any)._id?.toString() || facility.id;
    }

    const caseRecord = await createCase({
      ...validated,
      diseaseCode: validated.diseaseCode as DiseaseCode,
      symptoms: validated.symptoms as any,
      onsetDate: new Date(validated.onsetDate),
      facilityId,
      reporterId: user?.id || 'anonymous',
    });

    // Case record from Mongoose might have _id
    const caseId = (caseRecord as any)._id?.toString() || (caseRecord as any).id;

    const responseData = {
      ...caseRecord.toJSON?.() || caseRecord,
      id: caseId,
    };

    return successResponse(responseData, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Validation failed', 400, error.issues[0].message);
    }
    console.error('[API] Error creating case:', error);
    return errorResponse('Failed to create case');
  }
}
