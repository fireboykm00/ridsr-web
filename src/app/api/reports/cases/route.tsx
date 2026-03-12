import { NextRequest } from 'next/server';
import { z } from 'zod';
import { reportService, ReportFilters } from '@/lib/services/server/reportService';
import { requireAuth } from '@/lib/api/middleware';
import { isAuthError } from '@/lib/api/middleware';
import { CaseStatus, DiseaseCode, ValidationStatus } from '@/types';

const generateReportSchema = z.object({
  reportType: z.enum([
    'daily_facility',
    'weekly_facility',
    'monthly_facility',
    'weekly_district',
    'monthly_district',
    'quarterly_district',
    'monthly_national',
    'quarterly_national',
    'annual_national',
  ]),
  facilityId: z.string().optional(),
  district: z.union([z.string(), z.array(z.string())]).optional(),
  diseaseCode: z.string().optional(),
  status: z.union([z.string(), z.array(z.string())]).optional(),
  validationStatus: z.union([z.string(), z.array(z.string())]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

type GenerateReportBody = z.infer<typeof generateReportSchema>;

const getReportTitle = (reportType: string): string => {
  const titles: Record<string, string> = {
    daily_facility: 'Daily Facility Case Report',
    weekly_facility: 'Weekly Facility Case Report',
    monthly_facility: 'Monthly Facility Case Report',
    weekly_district: 'Weekly District Case Summary',
    monthly_district: 'Monthly District Case Summary',
    quarterly_district: 'Quarterly District Case Summary',
    monthly_national: 'Monthly National Disease Surveillance Report',
    quarterly_national: 'Quarterly National Disease Surveillance Report',
    annual_national: 'Annual National Disease Surveillance Report',
  };
  return titles[reportType] || 'Case Report';
};

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (isAuthError(user)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body: GenerateReportBody = await request.json();
    const validated = generateReportSchema.parse(body);

    let facilityId: string | undefined = validated.facilityId;

    if (facilityId === '__all_national__') {
      facilityId = undefined;
    } else if (facilityId === '__all_district__') {
      facilityId = undefined;
    }

    const filters: ReportFilters = {
      facilityId,
      district: typeof validated.district === 'string' ? validated.district : undefined,
      diseaseCode: validated.diseaseCode as DiseaseCode | undefined,
      status: typeof validated.status === 'string' ? validated.status as CaseStatus : undefined,
      validationStatus: typeof validated.validationStatus === 'string' ? validated.validationStatus as ValidationStatus : undefined,
    };

    if (validated.dateFrom) {
      filters.dateFrom = new Date(validated.dateFrom);
    }
    if (validated.dateTo) {
      filters.dateTo = new Date(validated.dateTo);
    }

    const reportData = await reportService.generateCaseReport(
      filters,
      user.role,
      user.facilityId,
      user.district
    );

    const generatedAt = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const title = getReportTitle(validated.reportType);

    const uniqueFacilities = [...new Set(reportData.cases.map((c: { facilityName: string; facilityCode?: string }) => 
      c.facilityCode ? `${c.facilityName} (${c.facilityCode})` : c.facilityName
    ).filter(Boolean))];
    
    const facilityDisplay = uniqueFacilities.length === 1 
      ? uniqueFacilities[0] 
      : uniqueFacilities.length > 1 
        ? `${uniqueFacilities.length} Facilities` 
        : null;
    
    const districtValue = typeof validated.district === 'string' ? validated.district : validated.district?.[0];
    const districtDisplay = districtValue ? districtValue.charAt(0).toUpperCase() + districtValue.slice(1) : null;
    
    const subtitle = [
      districtDisplay && `District: ${districtDisplay}`,
      facilityDisplay && `Facility: ${facilityDisplay}`,
      validated.diseaseCode && `Disease: ${validated.diseaseCode}`,
    ].filter(Boolean).join(' | ');

    return new Response(JSON.stringify({
      title,
      subtitle: subtitle || undefined,
      dateRange: reportData.dateRange,
      generatedAt,
      generatedBy: user.name || 'Unknown',
      cases: reportData.cases,
      summary: reportData.summary,
      filters: {
        district: districtDisplay || undefined,
        facilityName: facilityDisplay || undefined,
        diseaseCode: validated.diseaseCode,
        status: validated.status,
        validationStatus: validated.validationStatus,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.error('[Report] Error generating report:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (isAuthError(user)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        message: 'Case Report Data API',
        supportedReportTypes: [
          'daily_facility',
          'weekly_facility',
          'monthly_facility',
          'weekly_district',
          'monthly_district',
          'quarterly_district',
          'monthly_national',
          'quarterly_national',
          'annual_national',
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Report] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
