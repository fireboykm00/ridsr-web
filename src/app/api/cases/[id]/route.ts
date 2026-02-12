import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withAuth, withRoles, ROLE_PERMISSIONS } from '@/lib/api/middleware';
import { caseService } from '@/lib/services/server/caseService';
import { successResponse, errorResponse } from '@/lib/api/response';
import { updateCaseSchema } from '@/lib/schemas';
import { UserRole } from '@/types';

const updateCaseBodySchema = updateCaseSchema.extend({
  onsetDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await withAuth(request);
    // Non-blocking

    const { id } = await params;
    const caseRecord = await caseService.findById(id);

    if (!caseRecord) {
      return errorResponse('Case not found', 404);
    }

    return successResponse(caseRecord);
  } catch (error) {
    console.error('[API] Error fetching case:', error);
    return errorResponse('Failed to fetch case', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, hasAccess } = await withRoles(request, ROLE_PERMISSIONS.ALL_STAFF as unknown as UserRole[]);
    // Non-blocking

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateCaseBodySchema.parse(body);

    const caseRecord = await caseService.updateById(id, validatedData);

    if (!caseRecord) {
      return errorResponse('Case not found', 404);
    }

    return successResponse(caseRecord);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Validation failed', 400, error.issues[0].message);
    }
    console.error('[API] Error updating case:', error);
    return errorResponse('Failed to update case', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, hasAccess } = await withRoles(request, ROLE_PERMISSIONS.ADMIN as unknown as UserRole[]);
    // Non-blocking

    const { id } = await params;
    const success = await caseService.deleteById(id);

    if (!success) {
      return errorResponse('Case not found or could not be deleted', 404);
    }

    return successResponse({ message: 'Case deleted successfully' });
  } catch (error) {
    console.error('[API] Error deleting case:', error);
    return errorResponse('Failed to delete case', 500);
  }
}
