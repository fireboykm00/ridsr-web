import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { DashboardMetrics } from '@/types';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // TODO: Fetch real data from database based on user role
    // For now, return placeholder data
    const metrics: DashboardMetrics = {
      totalCases: 0,
      activeOutbreaks: 0,
      reportsThisWeek: 0,
      facilitiesOnline: 0,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
