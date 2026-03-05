import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { dashboardService } from '@/lib/services/server/dashboardService';
import { UserRole, RwandaDistrictType } from '@/types';
import { successResponse } from '@/lib/api/response';
import { serverErrorResponse } from '@/lib/api/error-utils';

export async function GET(request: NextRequest) {
  const session = await auth();
  // Non-blocking as requested
  const user = session?.user;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'default';

    const userContext = {
      id: user?.id || 'anonymous',
      role: (user?.role || 'health_worker') as UserRole,
      facilityId: user?.facilityId,
      district: user?.district as RwandaDistrictType
    };

    let stats;

    switch (type) {
      case 'national':
        stats = await dashboardService.getNationalStats(userContext);
        break;
      case 'district':
        stats = await dashboardService.getDistrictStats(userContext);
        break;
      case 'facility':
        stats = await dashboardService.getFacilityStats(userContext);
        break;
      case 'diseases':
        stats = await dashboardService.getCasesByDisease(userContext);
        break;
      case 'trend':
        const days = parseInt(searchParams.get('days') || '30');
        stats = await dashboardService.getCasesTrend(userContext, days);
        break;
      case 'districts':
        stats = await dashboardService.getDistrictSummaries(userContext, {
          dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom') as string) : undefined,
          dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo') as string) : undefined,
        });
        break;
      default:
        // Default behavior based on user role
        if (userContext.role === 'admin' || userContext.role === 'national_officer') {
          stats = await dashboardService.getNationalStats(userContext);
        } else if (userContext.role === 'district_officer') {
          stats = await dashboardService.getDistrictStats(userContext);
        } else {
          stats = await dashboardService.getFacilityStats(userContext);
        }
    }

    return successResponse(stats);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return serverErrorResponse(error, 'Failed to fetch dashboard data', 'DASHBOARD_FETCH_FAILED');
  }
}
