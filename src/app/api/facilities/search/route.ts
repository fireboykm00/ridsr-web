import { NextRequest } from 'next/server';
import { z } from 'zod';
import { isAuthError, requireAuth } from '@/lib/api/middleware';
import { facilityService } from '@/lib/services/server/facilityService';
import { successResponse, errorResponse } from '@/lib/api/response';
import { serverErrorResponse, validationErrorResponse } from '@/lib/api/error-utils';

const searchQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search term is required.'),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 50)).optional(),
  district: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const { q, limit = 10, district } = searchQuerySchema.parse(Object.fromEntries(searchParams.entries()));

    const facilities = await facilityService.searchFacilities(q, limit, district);
    return successResponse(facilities);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error, 'Invalid search parameters');
    }
    console.error('[API] Error searching facilities:', error);
    return serverErrorResponse(error, 'Failed to search facilities', 'FACILITY_SEARCH_FAILED');
  }
}
