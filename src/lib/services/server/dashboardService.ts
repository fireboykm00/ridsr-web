import { dbConnect } from '@/lib/services/db';
import { Case as CaseModel, User as UserModel, Facility as FacilityModel } from '@/lib/models';
import { UserRole, RwandaDistrictType, DashboardStats } from '@/types';

interface UserContext {
  id: string;
  role: UserRole;
  facilityId?: string;
  district?: RwandaDistrictType;
}

export class DashboardService {
  private async getFacilityFilter(user: UserContext) {
    if (user.role === 'admin' || user.role === 'national_officer') {
      return {};
    }

    if (user.role === 'district_officer' && user.district) {
      const facilities = await FacilityModel.find({ district: user.district }).select('_id');
      return { facilityId: { $in: facilities.map(f => f._id) } };
    }

    return { facilityId: user.facilityId };
  }

  async getNationalStats(user: UserContext): Promise<DashboardStats> {
    if (user.role !== 'admin' && user.role !== 'national_officer') {
      throw new Error('Insufficient permissions for national stats');
    }

    await dbConnect();

    const [totalCases, pendingCases, validatedCases, rejectedCases, totalFacilities, totalUsers] = await Promise.all([
      CaseModel.countDocuments(),
      CaseModel.countDocuments({ validationStatus: 'pending' }),
      CaseModel.countDocuments({ validationStatus: 'validated' }),
      CaseModel.countDocuments({ validationStatus: 'rejected' }),
      FacilityModel.countDocuments(),
      UserModel.countDocuments()
    ]);

    return {
      totalCases,
      pendingCases,
      validatedCases,
      rejectedCases,
      alerts: 0,
      totalFacilities,
      totalUsers,
      activeOutbreaks: 0
    };
  }

  async getDistrictStats(user: UserContext): Promise<DashboardStats> {
    if (user.role !== 'district_officer' && user.role !== 'admin' && user.role !== 'national_officer') {
      throw new Error('Insufficient permissions for district stats');
    }

    await dbConnect();
    const filter = await this.getFacilityFilter(user);

    const [totalCases, pendingCases, validatedCases, rejectedCases] = await Promise.all([
      CaseModel.countDocuments(filter),
      CaseModel.countDocuments({ ...filter, validationStatus: 'pending' }),
      CaseModel.countDocuments({ ...filter, validationStatus: 'validated' }),
      CaseModel.countDocuments({ ...filter, validationStatus: 'rejected' }),
    ]);

    return {
      totalCases,
      pendingCases,
      validatedCases,
      rejectedCases,
      alerts: 0,
      totalFacilities: 0,
      totalUsers: 0,
      activeOutbreaks: 0
    };
  }

  async getFacilityStats(user: UserContext): Promise<DashboardStats> {
    await dbConnect();
    const filter = await this.getFacilityFilter(user);

    const [totalCases, pendingCases, validatedCases, rejectedCases] = await Promise.all([
      CaseModel.countDocuments(filter),
      CaseModel.countDocuments({ ...filter, validationStatus: 'pending' }),
      CaseModel.countDocuments({ ...filter, validationStatus: 'validated' }),
      CaseModel.countDocuments({ ...filter, validationStatus: 'rejected' }),
    ]);

    return {
      totalCases,
      pendingCases,
      validatedCases,
      rejectedCases,
      alerts: 0,
      totalFacilities: 0,
      totalUsers: 0,
      activeOutbreaks: 0
    };
  }

  async getCasesByDisease(user: UserContext) {
    await dbConnect();
    const filter = await this.getFacilityFilter(user);

    return await CaseModel.aggregate([
      { $match: filter },
      { $group: { _id: '$diseaseCode', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
  }

  async getCasesTrend(user: UserContext, days: number = 30) {
    await dbConnect();
    const filter = await this.getFacilityFilter(user);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await CaseModel.aggregate([
      { $match: { ...filter, reportDate: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$reportDate' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }
}

export const dashboardService = new DashboardService();