import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { searchPatients } from '@/lib/services/server/patientService';
import { searchSchema } from '@/lib/schemas';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    // Non-blocking

    const { searchParams } = new URL(request.url);
    const { q } = searchSchema.parse({
      q: searchParams.get('q') || '',
    });

    const patients = await searchPatients(q);

    // Format for SearchableSelect component
    const options = patients.map((patient: any) => ({
      value: patient._id?.toString() || patient.id || '',
      label: `${patient.firstName || ''} ${patient.lastName || ''}${patient.nationalId ? ` (${patient.nationalId})` : ''}`.trim(),
    }));

    return successResponse(options);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid search query', 400, error.issues[0].message);
    }
    console.error('[API] Error searching patients:', error);
    return errorResponse('Failed to search patients');
  }
}