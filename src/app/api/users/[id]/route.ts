import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/services/db';
import { User as UserModel } from '@/lib/models';
import { USER_ROLES } from '@/types';
import { facilityService } from '@/lib/services/server/facilityService';
import { errorResponse, successResponse } from '@/lib/api/response';
import {
  serverErrorResponse,
  parseAndValidateBody,
  isApiValidationError,
  apiValidationErrorResponse,
} from '@/lib/api/error-utils';
import { z } from 'zod';
import { updateUserSchema } from '@/lib/schemas';

const updateUserBodySchema = updateUserSchema.extend({
  password: z.string().trim().min(6, 'Password must be at least 6 characters.').optional(),
});

function mapMongooseValidationErrors(error: unknown): Record<string, string> | undefined {
  if (
    !error ||
    typeof error !== 'object' ||
    !('errors' in error) ||
    !error.errors ||
    typeof error.errors !== 'object'
  ) {
    return undefined;
  }

  const rawErrors = error.errors as Record<string, { message?: string }>;
  const fieldErrors: Record<string, string> = {};
  for (const [field, details] of Object.entries(rawErrors)) {
    if (!fieldErrors[field] && details?.message) {
      fieldErrors[field] = details.message;
    }
  }
  return Object.keys(fieldErrors).length ? fieldErrors : undefined;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userContext = session?.user;

  try {
    const { id } = await params;
    await dbConnect();

    const canViewUser =
      userContext?.id === id ||
      userContext?.role === USER_ROLES.ADMIN ||
      userContext?.role === USER_ROLES.NATIONAL_OFFICER;

    if (!userContext) {
      return errorResponse('Unauthorized', 401);
    }

    if (!canViewUser) {
      return errorResponse('Forbidden', 403);
    }

    const user = await UserModel.findById(id).select('-password').lean();
    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return serverErrorResponse(error, 'Failed to fetch user', 'USER_GET_FAILED');
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userContext = session?.user;

  try {
    const { id } = await params;
    let data = (await parseAndValidateBody(request, updateUserBodySchema, {
      message: 'Please correct the highlighted user fields.',
    })) as Record<string, unknown>;
    await dbConnect();

    if (!userContext) {
      return errorResponse('Unauthorized', 401);
    }

    const canEditUser =
      userContext.id === id ||
      userContext.role === USER_ROLES.ADMIN ||
      userContext.role === USER_ROLES.NATIONAL_OFFICER;

    if (!canEditUser) {
      return errorResponse('Forbidden', 403);
    }

    // If updating own profile, restrict certain fields
    if (userContext && userContext.id === id && userContext.role !== USER_ROLES.ADMIN) {
      // Users can only update their profile identity/contact fields.
      const allowedFields = ['name', 'email', 'phone', 'password'];
      const updateData: Record<string, unknown> = {};

      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          updateData[field] = data[field];
        }
      }
      data = updateData;
    }

    // Hash password if provided
    if (data.password) {
      data.password = await bcrypt.hash(String(data.password), 12);
    }

    // Accept facility code (e.g. HC00055) or ObjectId.
    if (Object.prototype.hasOwnProperty.call(data, 'facilityId')) {
      const rawFacility = data.facilityId;
      if (typeof rawFacility === 'string') {
        const trimmed = rawFacility.trim();
        if (!trimmed) {
          data.facilityId = null;
          data.facilityName = null;
        } else if (!mongoose.Types.ObjectId.isValid(trimmed)) {
          const facility = await facilityService.getFacilityByCode(trimmed);
          if (!facility?._id) {
            return errorResponse('Facility not found', 404);
          }
          data.facilityId = facility._id;
          data.facilityName = facility.name;
        }
      }
    }

    // Add updatedAt timestamp
    data.updatedAt = new Date().toISOString();

    const user = await UserModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    }).select('-password').lean();

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user);
  } catch (error: unknown) {
    if (isApiValidationError(error)) {
      return apiValidationErrorResponse(error);
    }
    console.error('Error updating user:', error);

    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      return errorResponse('Duplicate user data', 409, 'Email, Worker ID, or National ID already exists', {
        code: 'USER_DUPLICATE',
      });
    }

    if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'ValidationError') {
      const fieldErrors = mapMongooseValidationErrors(error);
      const validationMessage =
        fieldErrors ? 'Please correct the highlighted user fields.' :
          ('message' in error ? String(error.message) : 'Validation failed');
      return errorResponse('Validation failed', 400, validationMessage, {
        code: 'VALIDATION_ERROR',
        fieldErrors,
      });
    }

    return serverErrorResponse(error, 'Failed to update user', 'USER_UPDATE_FAILED');
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userContext = session?.user;

  try {
    const { id } = await params;
    await dbConnect();

    if (!userContext) {
      return errorResponse('Unauthorized', 401);
    }

    const canDeleteUser =
      userContext.role === USER_ROLES.ADMIN ||
      userContext.role === USER_ROLES.NATIONAL_OFFICER;

    if (!canDeleteUser) {
      return errorResponse('Forbidden', 403);
    }

    // Prevent self-deletion
    if (userContext && userContext.id === id) {
      return errorResponse('Invalid operation', 400, 'Cannot delete your own account');
    }

    const success = await UserModel.findByIdAndDelete(id);
    if (!success) {
      return errorResponse('User not found', 404);
    }

    return successResponse({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return serverErrorResponse(error, 'Failed to delete user', 'USER_DELETE_FAILED');
  }
}
