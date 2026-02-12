import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withAuth, withRoles, ROLE_PERMISSIONS } from '@/lib/api/middleware';
import { userService } from '@/lib/services/server/userService';
import { successResponse, errorResponse } from '@/lib/api/response';
import { createUserSchema, paginationSchema } from '@/lib/schemas';
import { RwandaDistrictType, UserRole } from '@/types';

const getUsersQuerySchema = z.object({
  facilityId: z.string().optional(),
  role: z.enum(['admin', 'national_officer', 'district_officer', 'health_worker', 'lab_technician']).optional(),
  district: z.string().optional(),
  search: z.string().optional(),
}).merge(paginationSchema.partial());

export async function GET(request: NextRequest) {
  try {
    const { user } = await withAuth(request);

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const { facilityId, role, district, search, page, limit } = getUsersQuerySchema.parse(queryParams);

    const filters = {
      facilityId,
      role,
      district: (district || user?.district) as RwandaDistrictType | undefined,
      search
    };
    const users = await userService.getUsersWithFilters(filters, page, limit);

    return successResponse(users);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid query parameters', 400, error.issues[0].message);
    }
    console.error('[API] Error fetching users:', error);
    return errorResponse('Failed to fetch users', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, hasAccess } = await withRoles(request, ROLE_PERMISSIONS.ADMIN as unknown as UserRole[]);
    // Proceed as requested by user

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

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
      district: validatedData.district as RwandaDistrictType | undefined
    };

    const newUser = await userService.createUser(userData as any);
    return successResponse(newUser, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Validation failed', 400, error.issues[0].message);
    }
    console.error('[API] Error creating user:', error);
    return errorResponse('Failed to create user', 500);
  }
}
