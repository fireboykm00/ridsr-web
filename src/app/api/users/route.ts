import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireRoles, isAuthError } from '@/lib/api/middleware';
import { userService } from '@/lib/services/server/userService';
import { successResponse, errorResponse } from '@/lib/api/response';
import {
  serverErrorResponse,
  validationErrorResponse,
  parseAndValidateBody,
  isApiValidationError,
  apiValidationErrorResponse,
} from '@/lib/api/error-utils';
import { createUserSchema, paginationSchema } from '@/lib/schemas';
import { RwandaDistrictType, RwandaProvinceType, UserRole, USER_ROLES } from '@/types';

const getUsersQuerySchema = z.object({
  facilityId: z.string().optional(),
  role: z.enum(['admin', 'national_officer', 'district_officer', 'health_worker', 'lab_technician']).optional(),
  district: z.string().optional(),
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
}).merge(paginationSchema.partial());

const omitPassword = <T extends Record<string, unknown>>(user: T): Omit<T, 'password'> => {
  const { password, ...safeUser } = user;
  void password;
  return safeUser;
};

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const { facilityId, role, district, search, isActive, page, limit } = getUsersQuerySchema.parse(queryParams);

    const filters = {
      facilityId,
      role,
      district: (district || user?.district) as RwandaDistrictType | undefined,
      search,
      isActive: isActive === undefined ? undefined : isActive === 'true',
    };
    const users = await userService.getUsersWithFilters(filters, page, limit);

    const safeUsers = Array.isArray(users)
      ? users.map((user) => omitPassword(user as unknown as Record<string, unknown>))
      : {
        ...users,
        data: users.data.map((user) => omitPassword(user as unknown as Record<string, unknown>)),
      };

    return successResponse(safeUsers);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error, 'Invalid query parameters');
    }
    console.error('[API] Error fetching users:', error);
    return serverErrorResponse(error, 'Failed to fetch users', 'USER_FETCH_FAILED');
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRoles(request, [USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER] as unknown as UserRole[]);

    const validatedData = await parseAndValidateBody(request, createUserSchema, {
      message: 'Please correct the highlighted user fields.',
    });

    // Generate workerId if not provided
    let workerId = validatedData.workerId;
    if (!workerId) {
      const prefix = validatedData.role.substring(0, 2).toUpperCase();
      const random = Math.floor(1000 + Math.random() * 9000);
      workerId = `${prefix}${Date.now().toString().slice(-4)}${random}`;
    }

    const userData = {
      ...validatedData,
      workerId,
      role: validatedData.role as UserRole,
      district: validatedData.district as RwandaDistrictType | undefined,
      province: validatedData.province as RwandaProvinceType | undefined
    };

    const newUser = await userService.createUser(userData);
    return successResponse(newUser, 201);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    if (isApiValidationError(error)) {
      return apiValidationErrorResponse(error);
    }
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      return errorResponse('Duplicate user data', 409, 'Worker ID, email, or national ID already exists', {
        code: 'USER_DUPLICATE',
      });
    }
    console.error('[API] Error creating user:', error);
    return serverErrorResponse(error, 'Failed to create user', 'USER_CREATE_FAILED');
  }
}
