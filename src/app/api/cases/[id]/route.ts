import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireRoles, ROLE_PERMISSIONS, isAuthError } from '@/lib/api/middleware';
import { caseService } from '@/lib/services/server/caseService';
import { successResponse, errorResponse } from '@/lib/api/response';
import {
  serverErrorResponse,
  parseAndValidateBody,
  isApiValidationError,
  apiValidationErrorResponse,
} from '@/lib/api/error-utils';
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
    return serverErrorResponse(error, 'Failed to fetch case', 'CASE_GET_FAILED');
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRoles(request, ROLE_PERMISSIONS.ALL_STAFF as unknown as UserRole[]);

    const { id } = await params;
    const validatedData = await parseAndValidateBody(request, updateCaseBodySchema, {
      message: 'Please correct the highlighted case fields.',
    });

    const caseRecord = await caseService.updateById(id, validatedData);

    if (!caseRecord) {
      return errorResponse('Case not found', 404);
    }

    return successResponse(caseRecord);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    if (isApiValidationError(error)) {
      return apiValidationErrorResponse(error);
    }
    console.error('[API] Error updating case:', error);
    return serverErrorResponse(error, 'Failed to update case', 'CASE_UPDATE_FAILED');
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
    return serverErrorResponse(error, 'Failed to delete case', 'CASE_DELETE_FAILED');
  }
}
