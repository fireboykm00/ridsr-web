import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/services/db';
import { Case as CaseModel, Alert as AlertModel } from '@/lib/models';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await dbConnect();
    
    const totalCases = await CaseModel.countDocuments();
    const activeCases = await CaseModel.countDocuments({ validationStatus: 'PENDING' });
    const validatedCases = await CaseModel.countDocuments({ validationStatus: 'VALIDATED' });
    const alerts = await AlertModel.countDocuments({ status: 'ACTIVE' });

    return NextResponse.json({
      totalCases,
      activeCases,
      validatedCases,
      alerts,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
