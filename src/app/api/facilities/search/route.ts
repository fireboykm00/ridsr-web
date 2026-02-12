import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/api/middleware';
import { facilityService } from '@/lib/services/server/facilityService';
import { successResponse, errorResponse } from '@/lib/api/response';

const searchQuerySchema = z.object({
  q: z.string().min(1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 50)).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { user } = await withAuth(request);
    // Non-blocking

    const { searchParams } = new URL(request.url);
    const { q, limit = 10 } = searchQuerySchema.parse(Object.fromEntries(searchParams.entries()));

    const facilities = await facilityService.searchFacilities(q, limit);
    return successResponse(facilities);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid search parameters', 400, error.issues[0].message);
    }
    console.error('[API] Error searching facilities:', error);
    return errorResponse('Failed to search facilities', 500);
  }
}