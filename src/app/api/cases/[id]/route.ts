import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireRoles, ROLE_PERMISSIONS, isAuthError } from '@/lib/api/middleware';
import { caseService } from '@/lib/services/server/caseService';
import { successResponse, errorResponse } from '@/lib/api/response';
import { updateCaseSchema } from '@/lib/schemas';
import { UserRole } from '@/types';

const updateCaseBodySchema = updateCaseSchema.extend({
  onsetDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);

    const { id } = await params;
    const caseRecord = await caseService.findById(id);

    if (!caseRecord) {
      return errorResponse('Case not found', 404);
    }

    return successResponse(caseRecord);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    console.error('[API] Error fetching case:', error);
    return errorResponse('Failed to fetch case', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRoles(request, ROLE_PERMISSIONS.ALL_STAFF as unknown as UserRole[]);

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateCaseBodySchema.parse(body);

    const caseRecord = await caseService.updateById(id, validatedData);

    if (!caseRecord) {
      return errorResponse('Case not found', 404);
    }

    return successResponse(caseRecord);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    if (error instanceof z.ZodError) {
      return errorResponse('Validation failed', 400, error.issues[0].message);
    }
    console.error('[API] Error updating case:', error);
    return errorResponse('Failed to update case', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRoles(request, ROLE_PERMISSIONS.ADMIN as unknown as UserRole[]);

    const { id } = await params;
    const success = await caseService.deleteById(id);

    if (!success) {
      return errorResponse('Case not found or could not be deleted', 404);
    }

    return successResponse({ message: 'Case deleted successfully' });
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    console.error('[API] Error deleting case:', error);
    return errorResponse('Failed to delete case', 500);
  }
}
