import { Case as CaseModel } from '@/lib/models/Case';
import { Patient as PatientModel } from '@/lib/models/Patient';
import { Facility as FacilityModel } from '@/lib/models/Facility';
import { User as UserModel } from '@/lib/models/User';
import {
  CaseStatus,
  DiseaseCode,
  ValidationStatus,
  Facility as FacilityType,
  Patient as PatientType,
} from '@/types';
import mongoose from 'mongoose';
import { dbConnect } from '../db';

export interface ReportFilters {
  facilityId?: string;
  facilityIds?: string[];
  district?: string;
  diseaseCode?: DiseaseCode;
  validationStatus?: ValidationStatus;
  status?: CaseStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface CaseReportData {
  id: string;
  reportDate: string;
  diseaseCode: string;
  diseaseName: string;
  status: string;
  validationStatus: string;
  symptoms: string[];
  onsetDate: string;
  outcome?: string;
  facilityName: string;
  facilityCode?: string;
  facilityId: string;
  patientInfo: string;
  patientId: string;
  patientNationalId?: string;
  submittedBy?: string;
}

export interface ReportSummary {
  totalCases: number;
  byStatus: Record<string, number>;
  byValidation: Record<string, number>;
  byDisease: Record<string, number>;
  byDistrict: Record<string, number>;
}

export interface ReportResult {
  cases: CaseReportData[];
  summary: ReportSummary;
  filters: ReportFilters;
  dateRange: {
    from: string;
    to: string;
  };
}

class ReportService {
  async generateCaseReport(
    filters: ReportFilters,
    userRole?: string,
    userFacilityId?: string,
    userDistrict?: string
  ): Promise<ReportResult> {
    await dbConnect();

    const query: Record<string, unknown> = {};

    if (filters.diseaseCode) {
      query.diseaseCode = filters.diseaseCode;
    }
    
    if (filters.validationStatus) {
      query.validationStatus = filters.validationStatus;
    }
    
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      query.reportDate = {};
      if (filters.dateFrom) {
        (query.reportDate as Record<string, Date>).$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        const endOfDay = new Date(filters.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        (query.reportDate as Record<string, Date>).$lte = endOfDay;
      }
    }

    let facilityIds: mongoose.Types.ObjectId[] = [];
    
    if (filters.facilityId) {
      facilityIds = [new mongoose.Types.ObjectId(filters.facilityId)];
    } else if (filters.facilityIds?.length) {
      facilityIds = filters.facilityIds.map(id => new mongoose.Types.ObjectId(id));
    } else if (filters.district) {
      const facilities = await FacilityModel.find({ district: filters.district }).select('_id').lean();
      facilityIds = facilities.map((f: Record<string, { toString: () => string }>) => f._id as mongoose.Types.ObjectId);
    } else if (userRole === 'health_worker' || userRole === 'lab_technician') {
      if (userFacilityId) {
        facilityIds = [new mongoose.Types.ObjectId(userFacilityId)];
      }
    } else if (userRole === 'district_officer' && userDistrict) {
      const facilities = await FacilityModel.find({ district: userDistrict }).select('_id').lean();
      facilityIds = facilities.map((f: Record<string, { toString: () => string }>) => f._id as mongoose.Types.ObjectId);
    }

    if (facilityIds.length > 0) {
      query.facilityId = { $in: facilityIds };
    } else if (!filters.facilityId && !filters.facilityIds && !filters.district) {
      if (userRole === 'health_worker' || userRole === 'lab_technician') {
      } else if (userRole === 'district_officer' && userDistrict) {
      } else {
      }
    }

    const cases = await CaseModel.find(query)
      .sort({ reportDate: -1 })
      .lean();

    const facilityIdsSet = new Set<string>();
    const patientIdsSet = new Set<string>();
    const reporterIdsSet = new Set<string>();
    
    cases.forEach((c: Record<string, { toString: () => string }>) => {
      facilityIdsSet.add(c.facilityId.toString());
      patientIdsSet.add(c.patientId.toString());
      if (c.reporterId) reporterIdsSet.add(c.reporterId.toString());
    });

    const [facilities, patients, reporters] = await Promise.all([
      FacilityModel.find({ _id: { $in: Array.from(facilityIdsSet) } }).lean(),
      PatientModel.find({ _id: { $in: Array.from(patientIdsSet) } }).lean(),
      reporterIdsSet.size > 0
        ? UserModel.find({ _id: { $in: Array.from(reporterIdsSet) } }).select('_id name').lean()
        : Promise.resolve([]),
    ]);

    const facilityMap = new Map<string, FacilityType>();
    facilities.forEach((f: Record<string, unknown> & { _id: { toString: () => string }; name: string; code: string; type: string; district: string; province: string; isActive: boolean; createdAt: Date; updatedAt: Date }) => {
      facilityMap.set(f._id.toString(), {
        id: f._id.toString(),
        name: f.name,
        code: f.code,
        type: f.type as FacilityType['type'],
        district: f.district as FacilityType['district'],
        province: f.province as FacilityType['province'],
        isActive: f.isActive,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      } as FacilityType);
    });

    const patientMap = new Map<string, PatientType>();
    patients.forEach((p: Record<string, unknown> & { _id: { toString: () => string }; nationalId: string; firstName: string; lastName: string; dateOfBirth: Date; gender: string; phone: string; district: string; createdAt: Date; updatedAt: Date }) => {
      patientMap.set(p._id.toString(), {
        id: p._id.toString(),
        nationalId: p.nationalId,
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: p.dateOfBirth.toISOString(),
        gender: p.gender as PatientType['gender'],
        phone: p.phone,
        district: p.district as PatientType['district'],
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      } as PatientType);
    });

    const reporterMap = new Map<string, string>();
    reporters.forEach((r: Record<string, unknown> & { _id: { toString: () => string }; name?: string }) => {
      reporterMap.set(r._id.toString(), r.name || 'Unknown');
    });

    const diseaseNames: Record<string, string> = {
      CHOLERA: 'Cholera',
      MAL01: 'Malaria',
      SARI: 'Severe Acute Respiratory Illness',
      AFP: 'Acute Flaccid Paralysis',
      YELLOW_FEVER: 'Yellow Fever',
      RUBELLA: 'Rubella',
      MEASLES: 'Measles',
      PLAGUE: 'Plague',
      RABIES: 'Rabies',
      EBOLA: 'Ebola Virus Disease',
      MONKEYPOX: 'Monkeypox',
      TYPHOID: 'Typhoid Fever',
      HEPATITIS_E: 'Hepatitis E',
    };

    const caseReportData: CaseReportData[] = cases.map(c => {
      const facility = facilityMap.get(c.facilityId.toString());
      const patient = patientMap.get(c.patientId.toString());
      
      return {
        id: c._id.toString(),
        reportDate: c.reportDate.toISOString().split('T')[0],
        diseaseCode: c.diseaseCode,
        diseaseName: diseaseNames[c.diseaseCode] || c.diseaseCode,
        status: c.status,
        validationStatus: c.validationStatus,
        symptoms: c.symptoms || [],
        onsetDate: c.onsetDate.toISOString().split('T')[0],
        outcome: c.outcome || undefined,
        facilityName: facility?.name || 'Unknown',
        facilityCode: facility?.code || '',
        facilityId: facility?.id || '',
        patientInfo: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
        patientNationalId: patient?.nationalId || '',
        patientId: patient?.id || '',
        submittedBy: reporterMap.get(c.reporterId?.toString()) || '-',
      };
    });

    const summary: ReportSummary = {
      totalCases: cases.length,
      byStatus: {},
      byValidation: {},
      byDisease: {},
      byDistrict: {},
    };

    cases.forEach(c => {
      summary.byStatus[c.status] = (summary.byStatus[c.status] || 0) + 1;
      summary.byValidation[c.validationStatus] = (summary.byValidation[c.validationStatus] || 0) + 1;
      summary.byDisease[c.diseaseCode] = (summary.byDisease[c.diseaseCode] || 0) + 1;
      
      const facility = facilityMap.get(c.facilityId.toString());
      if (facility?.district) {
        summary.byDistrict[facility.district] = (summary.byDistrict[facility.district] || 0) + 1;
      }
    });

    const dateFrom = filters.dateFrom 
      ? new Date(filters.dateFrom).toISOString().split('T')[0]
      : cases.length > 0 
        ? cases.reduce((min, c) => c.reportDate < min ? c.reportDate.toISOString().split('T')[0] : min, cases[0].reportDate.toISOString().split('T')[0])
        : new Date().toISOString().split('T')[0];
        
    const dateTo = filters.dateTo
      ? new Date(filters.dateTo).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    return {
      cases: caseReportData,
      summary,
      filters,
      dateRange: { from: dateFrom, to: dateTo },
    };
  }
}

export const reportService = new ReportService();
