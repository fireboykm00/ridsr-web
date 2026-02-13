import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { searchPatients } from '@/lib/services/server/patientService';
import { searchSchema } from '@/lib/schemas';
import { successResponse } from '@/lib/api/response';
import { serverErrorResponse, validationErrorResponse } from '@/lib/api/error-utils';
import type { IPatient } from '@/lib/models/Patient';

export async function GET(request: NextRequest) {
  try {
    await auth();

    const { searchParams } = new URL(request.url);
    const { q } = searchSchema.parse({
      q: searchParams.get('q') || '',
    });

    const patients = await searchPatients(q);

    // Format for SearchableSelect component
    const options = patients.map((patient: IPatient) => ({
      value: patient._id.toString() || '',
      label: `${patient.firstName || ''} ${patient.lastName || ''}${patient.nationalId ? ` (${patient.nationalId})` : ''}`.trim(),
    }));

    return successResponse(options);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error, 'Invalid search query');
    }
    console.error('[API] Error searching patients:', error);
    return serverErrorResponse(error, 'Failed to search patients', 'PATIENT_SEARCH_FAILED');
  }
}
