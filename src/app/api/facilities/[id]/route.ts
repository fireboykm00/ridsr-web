import { NextRequest } from 'next/server';
import { dbConnect } from '@/lib/services/db';
import { Facility as FacilityModel } from '@/lib/models';
import { errorResponse, successResponse } from '@/lib/api/response';
import { isAuthError, requireAuth, requireRoles, ROLE_PERMISSIONS } from '@/lib/api/middleware';
import { UserRole } from '@/types';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    await dbConnect();
    const facility = await FacilityModel.findById(id).lean();
    if (!facility) return errorResponse('Facility not found', 404);
    return successResponse(facility);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    console.error('Error fetching facility:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRoles(request, ROLE_PERMISSIONS.MANAGEMENT as unknown as UserRole[]);
    const { id } = await params;
    const data = await request.json();
    await dbConnect();
    const facility = await FacilityModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!facility) return errorResponse('Facility not found', 404);
    return successResponse(facility);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    console.error('Error updating facility:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRoles(request, ROLE_PERMISSIONS.ADMIN as unknown as UserRole[]);
    const { id } = await params;
    await dbConnect();
    const facility = await FacilityModel.findByIdAndDelete(id);
    if (!facility) return errorResponse('Facility not found', 404);
    return successResponse({ message: 'Facility deleted' });
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    console.error('Error deleting facility:', error);
    return errorResponse('Internal server error', 500);
  }
}
