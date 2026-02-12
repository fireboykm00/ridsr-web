import { Patient, IPatient } from '@/lib/models/Patient';
import { BaseService } from './baseService';
import { Gender, RwandaDistrictType, RwandaProvinceType } from '@/types';

export interface CreatePatientData {
  nationalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  phone: string;
  address?: {
    street: string;
    sector: string;
    district: RwandaDistrictType;
    province: RwandaProvinceType;
    country: string;
  };
  district: RwandaDistrictType;
  occupation?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface UpdatePatientData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    street?: string;
    sector?: string;
    district?: RwandaDistrictType;
    province?: RwandaProvinceType;
    country?: string;
  };
  district?: RwandaDistrictType;
  occupation?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}

export interface PatientFilters {
  district?: RwandaDistrictType;
  gender?: Gender;
  ageFrom?: number;
  ageTo?: number;
  search?: string;
}

class PatientService extends BaseService<IPatient> {
  constructor() {
    super(Patient);
  }

  async createPatient(data: CreatePatientData): Promise<IPatient> {
    const patientData = {
      ...data,
      dateOfBirth: new Date(data.dateOfBirth),
    };
    return this.create(patientData as any);
  }

  async getPatientByNationalId(nationalId: string): Promise<IPatient | null> {
    await this.dbConnect();
    return this.model.findOne({ nationalId }).lean();
  }

  async searchPatients(searchTerm: string, limit: number = 10): Promise<IPatient[]> {
    await this.dbConnect();
    const searchRegex = new RegExp(searchTerm, 'i');

    return this.model.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { nationalId: searchRegex },
        { phone: searchRegex }
      ]
    }).limit(limit).lean();
  }

  async getPatientsWithFilters(filters: PatientFilters, page?: number, limit?: number): Promise<any> {
    const query: any = {};

    if (filters.district) {
      query.district = filters.district;
    }
    if (filters.gender) {
      query.gender = filters.gender;
    }
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { nationalId: searchRegex },
        { phone: searchRegex }
      ];
    }
    if (filters.ageFrom || filters.ageTo) {
      const now = new Date();
      if (filters.ageTo) {
        const minDate = new Date(now.getFullYear() - filters.ageTo, now.getMonth(), now.getDate());
        query.dateOfBirth = { $gte: minDate };
      }
      if (filters.ageFrom) {
        const maxDate = new Date(now.getFullYear() - filters.ageFrom, now.getMonth(), now.getDate());
        query.dateOfBirth = { ...query.dateOfBirth, $lte: maxDate };
      }
    }

    if (page && limit) {
      await this.dbConnect();
      const skip = (page - 1) * limit;
      const total = await this.model.countDocuments(query);
      const data = await this.model.find(query).skip(skip).limit(limit).lean();

      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      };
    }

    return this.findAll(query);
  }

  async getPatientsByDistrict(district: RwandaDistrictType): Promise<IPatient[]> {
    return this.findAll({ district });
  }

  async updatePatientById(id: string, data: UpdatePatientData): Promise<IPatient | null> {
    const updateData: any = {};

    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.phone) updateData.phone = data.phone;
    if (data.district) updateData.district = data.district;
    if (data.occupation) updateData.occupation = data.occupation;

    if (data.address) {
      Object.keys(data.address).forEach(key => {
        if (data.address![key as keyof typeof data.address]) {
          updateData[`address.${key}`] = data.address![key as keyof typeof data.address];
        }
      });
    }

    if (data.emergencyContact) {
      Object.keys(data.emergencyContact).forEach(key => {
        if (data.emergencyContact![key as keyof typeof data.emergencyContact]) {
          updateData[`emergencyContact.${key}`] = data.emergencyContact![key as keyof typeof data.emergencyContact];
        }
      });
    }

    return this.updateById(id, updateData);
  }

  private async dbConnect() {
    const { dbConnect } = await import('../db');
    return dbConnect();
  }
}

export const patientService = new PatientService();

// Export functions for API routes
export const getPatients = (filters?: PatientFilters, page?: number, limit?: number) =>
  patientService.getPatientsWithFilters(filters || {}, page, limit);

export const createPatient = (data: CreatePatientData) =>
  patientService.createPatient(data);

export const searchPatients = (searchTerm: string, limit?: number) =>
  patientService.searchPatients(searchTerm, limit);