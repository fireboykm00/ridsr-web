import { Case, ICase } from '@/lib/models/Case';
import { Patient } from '@/lib/models/Patient';
import { Facility } from '@/lib/models/Facility';
import { User } from '@/lib/models/User';
import { BaseService } from './baseService';
import { ValidationStatus, OutcomeStatus, CaseStatus, DiseaseCode, Symptom } from '@/types';
import mongoose from 'mongoose';

export interface CreateCaseData {
  patientId: string;
  facilityId: string;
  diseaseCode: DiseaseCode;
  symptoms: Symptom[];
  onsetDate: Date;
  reporterId: string;
  status?: CaseStatus;
}

export interface UpdateCaseData {
  diseaseCode?: DiseaseCode;
  symptoms?: Symptom[];
  onsetDate?: Date;
  validationStatus?: ValidationStatus;
  status?: CaseStatus;
  validatorId?: string;
  outcome?: OutcomeStatus;
}

export interface CaseFilters {
  facilityId?: string;
  diseaseCode?: DiseaseCode;
  validationStatus?: ValidationStatus;
  status?: CaseStatus;
  reporterId?: string;
  patientId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  district?: string;
}

class CaseService extends BaseService<ICase> {
  constructor() {
    super(Case);
  }

  async createCase(data: CreateCaseData): Promise<ICase> {
    const caseData = {
      ...data,
      patientId: new mongoose.Types.ObjectId(data.patientId),
      facilityId: new mongoose.Types.ObjectId(data.facilityId),
      reporterId: new mongoose.Types.ObjectId(data.reporterId),
      onsetDate: new Date(data.onsetDate),
      reportDate: new Date(),
      validationStatus: 'pending' as ValidationStatus,
      status: data.status || 'suspected' as CaseStatus,
    };

    const newCase = await this.create(caseData);

    // Get facility info for district - Removed Alert Triggering
    // const facility = await this.getFacilityInfo(data.facilityId);

    return newCase;
  }

  async getCasesByFacility(facilityId: string, page?: number, limit?: number): Promise<any> {
    const filter = { facilityId: new mongoose.Types.ObjectId(facilityId) };

    if (page && limit) {
      return this.findWithPagination(filter, page, limit);
    }

    return this.findAll(filter);
  }

  async getCasesByReporter(reporterId: string): Promise<ICase[]> {
    return this.findAll({ reporterId: new mongoose.Types.ObjectId(reporterId) });
  }

  async getCasesByPatient(patientId: string): Promise<ICase[]> {
    return this.findAll({ patientId: new mongoose.Types.ObjectId(patientId) });
  }

  async getCasesWithFilters(filters: CaseFilters, page?: number, limit?: number): Promise<any> {
    const query: any = {};

    if (filters.facilityId) {
      query.facilityId = new mongoose.Types.ObjectId(filters.facilityId);
    }
    if (filters.diseaseCode) {
      query.diseaseCode = filters.diseaseCode;
    }
    if (filters.validationStatus) {
      query.validationStatus = filters.validationStatus;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.reporterId) {
      query.reporterId = new mongoose.Types.ObjectId(filters.reporterId);
    }
    if (filters.patientId) {
      query.patientId = new mongoose.Types.ObjectId(filters.patientId);
    }
    if (filters.district) {
      query.district = filters.district;
    }
    if (filters.dateFrom || filters.dateTo) {
      query.reportDate = {};
      if (filters.dateFrom) query.reportDate.$gte = filters.dateFrom;
      if (filters.dateTo) query.reportDate.$lte = filters.dateTo;
    }

    if (page && limit) {
      return this.findWithPagination(query, page, limit);
    }

    return this.findAll(query);
  }

  async validateCase(caseId: string, validatorId: string, status: ValidationStatus): Promise<ICase | null> {
    return this.updateById(caseId, {
      validationStatus: status,
      validatorId: new mongoose.Types.ObjectId(validatorId),
      validationDate: new Date(),
    });
  }

  async updateCaseOutcome(caseId: string, outcome: OutcomeStatus): Promise<ICase | null> {
    return this.updateById(caseId, {
      outcome,
      outcomeDate: new Date(),
    });
  }

  async getPendingCases(facilityId?: string): Promise<ICase[]> {
    const filter: any = { validationStatus: 'pending' };
    if (facilityId) {
      filter.facilityId = new mongoose.Types.ObjectId(facilityId);
    }
    return this.findAll(filter);
  }

  // Helper methods for validation hub
  async getPatientInfo(patientId: string) {
    try {
      const patient = await Patient.findById(patientId).lean();
      return patient ? {
        id: patient._id,
        nationalId: patient.nationalId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        phone: patient.phone,
        district: patient.district,
      } : null;
    } catch (error) {
      console.error('Error fetching patient info:', error);
      return null;
    }
  }

  async getFacilityInfo(facilityId: string) {
    try {
      const facility = await Facility.findById(facilityId).lean();
      return facility ? {
        id: facility._id,
        name: facility.name,
        code: facility.code,
        type: facility.type,
        district: facility.district,
      } : null;
    } catch (error) {
      console.error('Error fetching facility info:', error);
      return null;
    }
  }

  async getReporterInfo(reporterId: string) {
    try {
      const reporter = await User.findById(reporterId).lean();
      return reporter ? {
        id: reporter._id,
        name: reporter.name,
        email: reporter.email,
        role: reporter.role,
      } : null;
    } catch (error) {
      console.error('Error fetching reporter info:', error);
      return null;
    }
  }
}

export const caseService = new CaseService();

// Export functions for API routes
export const getCases = (filters?: CaseFilters, page?: number, limit?: number) =>
  caseService.getCasesWithFilters(filters || {}, page, limit);

export const createCase = (data: CreateCaseData) =>
  caseService.createCase(data);