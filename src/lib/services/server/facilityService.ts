import { Facility, IFacility } from '@/lib/models/Facility';
import { BaseService, PaginatedResult } from './baseService';
import { FacilityType, RwandaDistrictType, RwandaProvinceType } from '@/types';
import { FilterQuery, UpdateQuery } from 'mongoose';

export interface CreateFacilityData {
  name: string;
  code: string;
  type: FacilityType;
  district: RwandaDistrictType;
  province: RwandaProvinceType;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

export interface UpdateFacilityData {
  name?: string;
  code?: string;
  type?: FacilityType;
  district?: RwandaDistrictType;
  province?: RwandaProvinceType;
  contactPerson?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface FacilityFilters {
  type?: FacilityType;
  district?: RwandaDistrictType;
  province?: RwandaProvinceType;
  isActive?: boolean;
  search?: string;
}

class FacilityService extends BaseService<IFacility> {
  constructor() {
    super(Facility);
  }

  async createFacility(data: CreateFacilityData): Promise<IFacility> {
    return this.create(data);
  }

  async getFacilityByCode(code: string): Promise<IFacility | null> {
    await this.dbConnect();
    return this.model.findOne({ code }).lean();
  }

  async searchFacilities(searchTerm: string, limit: number = 10, district?: string): Promise<IFacility[]> {
    await this.dbConnect();
    const searchRegex = new RegExp(searchTerm, 'i');

    const query: Record<string, unknown> = {
      $or: [
        { name: searchRegex },
        { code: searchRegex }
      ],
      isActive: true
    };

    if (district) {
      query.district = district;
    }

    return this.model.find(query).limit(limit).lean();
  }

  async getFacilitiesWithFilters(
    filters: FacilityFilters,
    page?: number,
    limit?: number
  ): Promise<IFacility[] | PaginatedResult<IFacility>> {
    const query: FilterQuery<IFacility> = {};

    if (filters.type) {
      query.type = filters.type;
    }
    if (filters.district) {
      query.district = filters.district;
    }
    if (filters.province) {
      query.province = filters.province;
    }
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [
        { name: searchRegex },
        { code: searchRegex }
      ];
    }

    if (page && limit) {
      return this.findWithPagination(query, page, limit);
    }

    return this.findAll(query);
  }

  async getFacilitiesByDistrict(district: RwandaDistrictType): Promise<IFacility[]> {
    return this.findAll({ district, isActive: true });
  }

  async getFacilitiesByProvince(province: RwandaProvinceType): Promise<IFacility[]> {
    return this.findAll({ province, isActive: true });
  }

  async getFacilitiesByType(type: FacilityType): Promise<IFacility[]> {
    return this.findAll({ type, isActive: true });
  }

  async getActiveFacilities(): Promise<IFacility[]> {
    return this.findAll({ isActive: true });
  }

  async deactivateFacility(facilityId: string): Promise<IFacility | null> {
    return this.updateById(facilityId, { isActive: false });
  }

  async activateFacility(facilityId: string): Promise<IFacility | null> {
    return this.updateById(facilityId, { isActive: true });
  }

  async updateFacilityById(id: string, data: UpdateFacilityData): Promise<IFacility | null> {
    const updateData: UpdateQuery<IFacility> = {};

    if (data.name) updateData.name = data.name;
    if (data.code) updateData.code = data.code;
    if (data.type) updateData.type = data.type;
    if (data.district) updateData.district = data.district;
    if (data.province) updateData.province = data.province;
    if (data.contactPerson) updateData.contactPerson = data.contactPerson;
    if (data.phone) updateData.phone = data.phone;
    if (data.email) updateData.email = data.email;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return this.updateById(id, updateData);
  }

  private async dbConnect() {
    const { dbConnect } = await import('../db');
    return dbConnect();
  }
}

export const facilityService = new FacilityService();
