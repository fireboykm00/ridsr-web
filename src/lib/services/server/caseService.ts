import { Case, ICase } from '@/lib/models/Case';
import { Patient } from '@/lib/models/Patient';
import { Facility } from '@/lib/models/Facility';
import { User } from '@/lib/models/User';
import { BaseService, PaginatedResult } from './baseService';
import {
  ValidationStatus,
  OutcomeStatus,
  CaseStatus,
  DiseaseCode,
  Symptom,
  LabResult,
  LabResultInterpretation,
  USER_ROLES,
  UserRole,
} from '@/types';
import mongoose, { FilterQuery } from 'mongoose';
import { dbConnect } from '../db';

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

interface ActionActor {
  id?: string;
  role?: UserRole;
  facilityId?: string;
}

type LabResultInput = Pick<
  LabResult,
  'testType' | 'testName' | 'testDate' | 'resultValue' | 'interpretation' | 'resultUnit' | 'referenceRange'
>;

type LabResultPatch = Partial<LabResultInput>;

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

  async getCasesByFacility(
    facilityId: string,
    page?: number,
    limit?: number
  ): Promise<ICase[] | PaginatedResult<ICase>> {
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

  async getCasesWithFilters(
    filters: CaseFilters,
    page?: number,
    limit?: number
  ): Promise<ICase[] | PaginatedResult<ICase>> {
    const query: FilterQuery<ICase> = {};

    let facilityFilterId: mongoose.Types.ObjectId | undefined;
    if (filters.facilityId) {
      facilityFilterId = new mongoose.Types.ObjectId(filters.facilityId);
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
      const districtFacilities = await Facility.find({ district: filters.district }).select('_id').lean();
      const districtFacilityIds = districtFacilities
        .map((f) => f._id)
        .filter((id): id is mongoose.Types.ObjectId => Boolean(id));

      if (facilityFilterId) {
        const inDistrict = districtFacilityIds.some((id) => id.equals(facilityFilterId));
        query.facilityId = inDistrict ? facilityFilterId : { $in: [] };
      } else {
        query.facilityId = { $in: districtFacilityIds };
      }
    } else if (facilityFilterId) {
      query.facilityId = facilityFilterId;
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
    const filter: FilterQuery<ICase> = { validationStatus: 'pending' };
    if (facilityId) {
      filter.facilityId = new mongoose.Types.ObjectId(facilityId);
    }
    return this.findAll(filter);
  }

  private toIdString(value: unknown): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && 'toString' in value && typeof value.toString === 'function') {
      return value.toString();
    }
    return '';
  }

  private toIso(value: unknown): string {
    if (!value) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return value;
    return '';
  }

  private assertCaseScope(caseRecord: ICase, actor: ActionActor) {
    if (actor.role === USER_ROLES.LAB_TECHNICIAN) {
      if (!actor.facilityId || this.toIdString(caseRecord.facilityId) !== actor.facilityId) {
        throw new Error('FORBIDDEN');
      }
    }
  }

  private normalizeLabResult(
    source: Record<string, unknown>,
    caseId: string,
    facilityId: string
  ): LabResult {
    const id = this.toIdString(source._id) || this.toIdString(source.id);
    return {
      id,
      caseId,
      facilityId,
      testType: String(source.testType || ''),
      testName: String(source.testName || ''),
      testDate: this.toIso(source.testDate),
      resultValue: String(source.resultValue || ''),
      interpretation: (source.interpretation || 'equivocal') as LabResultInterpretation,
      resultUnit: source.resultUnit ? String(source.resultUnit) : undefined,
      referenceRange: source.referenceRange ? String(source.referenceRange) : undefined,
      technicianId: this.toIdString(source.technicianId),
      validatedBy: source.validatedBy ? this.toIdString(source.validatedBy) : undefined,
      validatedAt: source.validatedAt ? this.toIso(source.validatedAt) : undefined,
      createdAt: this.toIso(source.createdAt),
      updatedAt: this.toIso(source.updatedAt),
    };
  }

  async getCaseLabResults(caseId: string, actor: ActionActor): Promise<LabResult[]> {
    const caseRecord = await this.findById(caseId);
    if (!caseRecord) {
      throw new Error('NOT_FOUND');
    }

    this.assertCaseScope(caseRecord, actor);

    const caseRecordAny = caseRecord as unknown as { labResults?: Record<string, unknown>[]; facilityId?: unknown; _id?: unknown };
    const results = Array.isArray(caseRecordAny.labResults) ? caseRecordAny.labResults : [];
    const normalizedCaseId = this.toIdString(caseRecordAny._id) || caseId;
    const normalizedFacilityId = this.toIdString(caseRecordAny.facilityId);

    return results.map((result) => this.normalizeLabResult(result, normalizedCaseId, normalizedFacilityId));
  }

  async addCaseLabResult(caseId: string, result: LabResultInput, actor: ActionActor): Promise<LabResult> {
    await dbConnect();
    const caseRecord = await Case.findById(caseId);
    if (!caseRecord) {
      throw new Error('NOT_FOUND');
    }

    this.assertCaseScope(caseRecord as unknown as ICase, actor);

    if (!actor.id) {
      throw new Error('UNAUTHORIZED');
    }

    const caseDoc = caseRecord as unknown as {
      _id: mongoose.Types.ObjectId;
      facilityId: mongoose.Types.ObjectId;
      labResults?: unknown[];
      save: () => Promise<unknown>;
    };

    if (!Array.isArray(caseDoc.labResults)) {
      caseDoc.labResults = [];
    }

    caseDoc.labResults.push({
      testType: result.testType.trim(),
      testName: result.testName.trim(),
      testDate: new Date(result.testDate),
      resultValue: result.resultValue.trim(),
      interpretation: result.interpretation,
      resultUnit: result.resultUnit?.trim() || undefined,
      referenceRange: result.referenceRange?.trim() || undefined,
      technicianId: new mongoose.Types.ObjectId(actor.id),
    });

    await caseDoc.save();
    const created = caseDoc.labResults[caseDoc.labResults.length - 1] as Record<string, unknown>;
    return this.normalizeLabResult(created, caseDoc._id.toString(), caseDoc.facilityId.toString());
  }

  async updateCaseLabResult(
    caseId: string,
    resultId: string,
    patch: LabResultPatch,
    actor: ActionActor
  ): Promise<LabResult> {
    await dbConnect();
    const caseRecord = await Case.findById(caseId);
    if (!caseRecord) {
      throw new Error('NOT_FOUND');
    }

    this.assertCaseScope(caseRecord as unknown as ICase, actor);

    const caseDoc = caseRecord as unknown as {
      _id: mongoose.Types.ObjectId;
      facilityId: mongoose.Types.ObjectId;
      labResults?: Array<{ _id?: mongoose.Types.ObjectId; [key: string]: unknown }>;
      save: () => Promise<unknown>;
    };
    if (!Array.isArray(caseDoc.labResults) || caseDoc.labResults.length === 0) {
      throw new Error('NOT_FOUND');
    }

    const target = caseDoc.labResults.find((item) => this.toIdString(item._id) === resultId);
    if (!target) {
      throw new Error('NOT_FOUND');
    }

    if (patch.testType !== undefined) target.testType = patch.testType.trim();
    if (patch.testName !== undefined) target.testName = patch.testName.trim();
    if (patch.testDate !== undefined) target.testDate = new Date(patch.testDate);
    if (patch.resultValue !== undefined) target.resultValue = patch.resultValue.trim();
    if (patch.interpretation !== undefined) target.interpretation = patch.interpretation;
    if (patch.resultUnit !== undefined) target.resultUnit = patch.resultUnit?.trim() || undefined;
    if (patch.referenceRange !== undefined) target.referenceRange = patch.referenceRange?.trim() || undefined;

    await caseDoc.save();
    return this.normalizeLabResult(target as unknown as Record<string, unknown>, caseDoc._id.toString(), caseDoc.facilityId.toString());
  }

  async applyCaseDecision(
    caseId: string,
    decision: { validationStatus: 'validated' | 'rejected'; status?: 'confirmed' | 'invalidated' },
    actor: ActionActor
  ): Promise<ICase> {
    await dbConnect();
    const caseRecord = await Case.findById(caseId);
    if (!caseRecord) {
      throw new Error('NOT_FOUND');
    }

    this.assertCaseScope(caseRecord as unknown as ICase, actor);

    if (!actor.id) {
      throw new Error('UNAUTHORIZED');
    }

    caseRecord.validationStatus = decision.validationStatus;
    caseRecord.validatorId = new mongoose.Types.ObjectId(actor.id);
    caseRecord.validationDate = new Date();
    if (decision.status) {
      caseRecord.status = decision.status;
    }

    await caseRecord.save();
    return caseRecord.toObject() as ICase;
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
