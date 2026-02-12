import { User, IUser } from '@/lib/models/User';
import { BaseService } from './baseService';
import { UserRole, RwandaDistrictType, RwandaProvinceType } from '@/types';
import mongoose from 'mongoose';
import { facilityService } from './facilityService';
import { hashPassword, verifyPassword } from '@/lib/utils/auth';

export interface CreateUserData {
  workerId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  facilityId?: string;
  facilityName?: string;
  district?: RwandaDistrictType;
  province?: RwandaProvinceType;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  facilityId?: string;
  facilityName?: string;
  district?: RwandaDistrictType;
  province?: RwandaProvinceType;
  isActive?: boolean;
}

export interface UserFilters {
  role?: UserRole;
  facilityId?: string;
  district?: RwandaDistrictType;
  isActive?: boolean;
  search?: string;
}

class UserService extends BaseService<IUser> {
  constructor() {
    super(User);
  }

  async createUser(data: CreateUserData): Promise<IUser> {
    const hashedPassword = await hashPassword(data.password);

    let facilityName = data.facilityName;
    let facilityObjectId;
    
    if (data.facilityId) {
      // If facilityId is a code (not ObjectId), look it up
      if (data.facilityId.length < 24) {
        const facility = await facilityService.getFacilityByCode(data.facilityId);
        if (facility) {
          facilityName = (facility as any).name;
          facilityObjectId = (facility as any)._id;
        }
      } else {
        facilityObjectId = new mongoose.Types.ObjectId(data.facilityId);
        if (!facilityName) {
          const facility = await facilityService.findById(data.facilityId);
          if (facility) {
            facilityName = (facility as any).name;
          }
        }
      }
    }

    const userData = {
      ...data,
      password: hashedPassword,
      facilityId: facilityObjectId,
      facilityName,
    };

    return this.create(userData);
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    await this.dbConnect();
    return this.model.findOne({ email }).lean();
  }

  async validatePassword(user: IUser, password: string): Promise<boolean> {
    return verifyPassword(password, user.password);
  }

  async updatePassword(userId: string, newPassword: string): Promise<IUser | null> {
    const hashedPassword = await hashPassword(newPassword);
    return this.updateById(userId, { password: hashedPassword });
  }

  async getUsersWithFilters(filters: UserFilters, page?: number, limit?: number): Promise<any> {
    const query: any = {};

    if (filters.role) {
      query.role = filters.role;
    }
    if (filters.facilityId) {
      query.facilityId = new mongoose.Types.ObjectId(filters.facilityId);
    }
    if (filters.district) {
      query.district = filters.district;
    }
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    if (page && limit) {
      return this.findWithPagination(query, page, limit);
    }

    return this.findAll(query);
  }

  async getUsersByRole(role: UserRole): Promise<IUser[]> {
    return this.findAll({ role });
  }

  async getUsersByFacility(facilityId: string): Promise<IUser[]> {
    return this.findAll({ facilityId: new mongoose.Types.ObjectId(facilityId) });
  }

  async getUsersByDistrict(district: RwandaDistrictType): Promise<IUser[]> {
    return this.findAll({ district });
  }

  async getActiveUsers(): Promise<IUser[]> {
    return this.findAll({ isActive: true });
  }

  async deactivateUser(userId: string): Promise<IUser | null> {
    return this.updateById(userId, { isActive: false });
  }

  async activateUser(userId: string): Promise<IUser | null> {
    return this.updateById(userId, { isActive: true });
  }

  async updateUserById(id: string, data: UpdateUserData): Promise<IUser | null> {
    const updateData: any = { ...data };

    // Handle facilityId - remove if empty/null, otherwise convert
    if (data.facilityId !== undefined) {
      if (!data.facilityId || data.facilityId.trim() === '') {
        // Remove facility if empty
        updateData.facilityId = null;
        updateData.facilityName = null;
      } else {
        // If facilityId is a code (not ObjectId), look it up
        if (data.facilityId.length < 24) {
          const facility = await facilityService.getFacilityByCode(data.facilityId);
          if (facility) {
            updateData.facilityId = (facility as any)._id;
            if (!data.facilityName) {
              updateData.facilityName = (facility as any).name;
            }
          }
        } else {
          updateData.facilityId = new mongoose.Types.ObjectId(data.facilityId);
          if (!data.facilityName) {
            const facility = await facilityService.findById(data.facilityId);
            if (facility) {
              updateData.facilityName = (facility as any).name;
            }
          }
        }
      }
    }

    return this.updateById(id, updateData);
  }

  async searchUsers(searchTerm: string, limit: number = 10): Promise<IUser[]> {
    await this.dbConnect();
    const searchRegex = new RegExp(searchTerm, 'i');

    return this.model.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex }
      ],
      isActive: true
    }).limit(limit).lean();
  }

  private async dbConnect() {
    const { dbConnect } = await import('../db');
    return dbConnect();
  }
}

export const userService = new UserService();