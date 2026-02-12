import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireRoles, ROLE_PERMISSIONS, isAuthError } from '@/lib/api/middleware';
import { caseService } from '@/lib/services/server/caseService';
import { successResponse, errorResponse } from '@/lib/api/response';
import { ValidationStatus, UserRole } from '@/types';

const validateCaseSchema = z.object({
  validationStatus: z.enum(['validated', 'rejected']),
  validationNotes: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRoles(request, ROLE_PERMISSIONS.MANAGEMENT as unknown as UserRole[]);

    const { id } = await params;
    const body = await request.json();
    const { validationStatus, validationNotes } = validateCaseSchema.parse(body);

    // Check if case exists and is pending
    const existingCase = await caseService.findById(id);
    if (!existingCase) {
      return errorResponse('Case not found', 404);
    }

    if (existingCase.validationStatus !== 'pending') {
      return errorResponse('Case has already been validated', 400);
    }

    // Update case with validation
    const caseRecord = await caseService.validateCase(
      id,
      user.id || 'anonymous',
      validationStatus as ValidationStatus
    );

    if (!caseRecord) {
      return errorResponse('Failed to validate case', 500);
    }

    return successResponse({
      ...caseRecord,
      validationNotes,
      message: `Case ${validationStatus} successfully`
    });
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    if (error instanceof z.ZodError) {
      return errorResponse('Validation failed', 400, error.issues[0].message);
    }
    console.error('[API] Error validating case:', error);
    return errorResponse('Failed to validate case', 500);
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRoles(request, ROLE_PERMISSIONS.MANAGEMENT as unknown as UserRole[]);

    const { id } = await params;
    const caseRecord = await caseService.findById(id);

    if (!caseRecord) {
      return errorResponse('Case not found', 404);
    }

    const validationInfo = {
      id: caseRecord._id,
      validationStatus: caseRecord.validationStatus,
      validatorId: caseRecord.validatorId,
      validationDate: caseRecord.validationDate,
      canValidate: caseRecord.validationStatus === 'pending'
    };

    return successResponse(validationInfo);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    console.error('[API] Error fetching case validation info:', error);
    return errorResponse('Failed to fetch validation info', 500);
  }
}
