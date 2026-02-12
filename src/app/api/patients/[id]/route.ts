import { NextRequest } from 'next/server';
import { dbConnect } from '@/lib/services/db';
import { Patient as PatientModel } from '@/lib/models';
import { errorResponse, successResponse } from '@/lib/api/response';
import { isAuthError, requireAuth, requireRoles, ROLE_PERMISSIONS } from '@/lib/api/middleware';
import { UserRole } from '@/types';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    await dbConnect();
    const patient = await PatientModel.findById(id).lean();
    if (!patient) return errorResponse('Patient not found', 404);
    return successResponse(patient);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    console.error('Error fetching patient:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRoles(request, ROLE_PERMISSIONS.ALL_STAFF as unknown as UserRole[]);
    const { id } = await params;
    const data = await request.json();
    await dbConnect();
    const patient = await PatientModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!patient) return errorResponse('Patient not found', 404);
    return successResponse(patient);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    console.error('Error updating patient:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRoles(request, ROLE_PERMISSIONS.ADMIN as unknown as UserRole[]);
    const { id } = await params;
    await dbConnect();
    const patient = await PatientModel.findByIdAndDelete(id);
    if (!patient) return errorResponse('Patient not found', 404);
    return successResponse({ message: 'Patient deleted' });
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    console.error('Error deleting patient:', error);
    return errorResponse('Internal server error', 500);
  }
}
