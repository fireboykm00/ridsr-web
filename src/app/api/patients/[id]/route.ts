import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/services/db';
import { Patient as PatientModel } from '@/lib/models';
import { errorResponse, successResponse } from '@/lib/api/response';
import { isAuthError, requireAuth, requireRoles, ROLE_PERMISSIONS } from '@/lib/api/middleware';
import {
  serverErrorResponse,
  parseAndValidateBody,
  isApiValidationError,
  apiValidationErrorResponse,
} from '@/lib/api/error-utils';
import { UserRole } from '@/types';
import { updatePatientSchema } from '@/lib/schemas';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid patient ID', 400, 'Patient ID format is invalid');
    }
    await dbConnect();
    const patient = await PatientModel.findById(id).lean();
    if (!patient) return errorResponse('Patient not found', 404);
    return successResponse(patient);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    console.error('Error fetching patient:', error);
    return serverErrorResponse(error, 'Failed to fetch patient', 'PATIENT_GET_FAILED');
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRoles(request, ROLE_PERMISSIONS.ALL_STAFF as unknown as UserRole[]);
    const { id } = await params;
    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid patient ID', 400, 'Patient ID format is invalid');
    }
    const data = await parseAndValidateBody(request, updatePatientSchema, {
      message: 'Please correct the highlighted patient fields.',
    });
    await dbConnect();
    const patient = await PatientModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!patient) return errorResponse('Patient not found', 404);
    return successResponse(patient);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    if (isApiValidationError(error)) {
      return apiValidationErrorResponse(error);
    }
    console.error('Error updating patient:', error);
    return serverErrorResponse(error, 'Failed to update patient', 'PATIENT_UPDATE_FAILED');
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRoles(request, ROLE_PERMISSIONS.ADMIN as unknown as UserRole[]);
    const { id } = await params;
    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid patient ID', 400, 'Patient ID format is invalid');
    }
    await dbConnect();
    const patient = await PatientModel.findByIdAndDelete(id);
    if (!patient) return errorResponse('Patient not found', 404);
    return successResponse({ message: 'Patient deleted' });
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    console.error('Error deleting patient:', error);
    return serverErrorResponse(error, 'Failed to delete patient', 'PATIENT_DELETE_FAILED');
  }
}
