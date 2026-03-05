import { dbConnect } from '@/lib/services/db';
import { Case as CaseModel, User as UserModel, Facility as FacilityModel } from '@/lib/models';
import { UserRole, RwandaDistrictType, DashboardStats } from '@/types';
import { alertService } from './alertService';

interface UserContext {
  id: string;
  role: UserRole;
  facilityId?: string;
  district?: RwandaDistrictType;
}

interface DistrictSummaryOptions {
  dateFrom?: Date;
  dateTo?: Date;
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

    const [totalCases, pendingCases, validatedCases, rejectedCases, totalFacilities, totalUsers, alerts] = await Promise.all([
      CaseModel.countDocuments(),
      CaseModel.countDocuments({ validationStatus: 'pending' }),
      CaseModel.countDocuments({ validationStatus: 'validated' }),
      CaseModel.countDocuments({ validationStatus: 'rejected' }),
      FacilityModel.countDocuments(),
      UserModel.countDocuments(),
      alertService.countActiveAlerts(user),
    ]);

    return {
      totalCases,
      pendingCases,
      validatedCases,
      rejectedCases,
      alerts,
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

    const [totalCases, pendingCases, validatedCases, rejectedCases, alerts] = await Promise.all([
      CaseModel.countDocuments(filter),
      CaseModel.countDocuments({ ...filter, validationStatus: 'pending' }),
      CaseModel.countDocuments({ ...filter, validationStatus: 'validated' }),
      CaseModel.countDocuments({ ...filter, validationStatus: 'rejected' }),
      alertService.countActiveAlerts(user),
    ]);

    return {
      totalCases,
      pendingCases,
      validatedCases,
      rejectedCases,
      alerts,
      totalFacilities: 0,
      totalUsers: 0,
      activeOutbreaks: 0
    };
  }

  async getFacilityStats(user: UserContext): Promise<DashboardStats> {
    await dbConnect();
    const filter = await this.getFacilityFilter(user);

    const [totalCases, pendingCases, validatedCases, rejectedCases, alerts] = await Promise.all([
      CaseModel.countDocuments(filter),
      CaseModel.countDocuments({ ...filter, validationStatus: 'pending' }),
      CaseModel.countDocuments({ ...filter, validationStatus: 'validated' }),
      CaseModel.countDocuments({ ...filter, validationStatus: 'rejected' }),
      alertService.countActiveAlerts(user),
    ]);

    return {
      totalCases,
      pendingCases,
      validatedCases,
      rejectedCases,
      alerts,
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

  async getDistrictSummaries(user: UserContext, options: DistrictSummaryOptions = {}) {
    if (user.role !== 'admin' && user.role !== 'national_officer') {
      throw new Error('Insufficient permissions for district summaries');
    }

    await dbConnect();

    const dateFilter = options.dateFrom || options.dateTo
      ? {
        reportDate: {
          ...(options.dateFrom ? { $gte: options.dateFrom } : {}),
          ...(options.dateTo ? { $lte: options.dateTo } : {}),
        },
      }
      : {};

    const [facilitiesAgg, casesAgg] = await Promise.all([
      FacilityModel.aggregate([
        { $group: { _id: '$district', facilities: { $sum: 1 } } },
      ]),
      CaseModel.aggregate([
        { $match: dateFilter },
        {
          $lookup: {
            from: 'facilities',
            localField: 'facilityId',
            foreignField: '_id',
            as: 'facility',
          },
        },
        { $unwind: '$facility' },
        {
          $group: {
            _id: '$facility.district',
            totalCases: { $sum: 1 },
            pendingCases: {
              $sum: {
                $cond: [{ $eq: ['$validationStatus', 'pending'] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    const districtMap = new Map<string, { district: string; facilities: number; totalCases: number; pendingCases: number }>();
    for (const item of facilitiesAgg) {
      districtMap.set(item._id, {
        district: item._id,
        facilities: item.facilities || 0,
        totalCases: 0,
        pendingCases: 0,
      });
    }
    for (const item of casesAgg) {
      const existing = districtMap.get(item._id) || {
        district: item._id,
        facilities: 0,
        totalCases: 0,
        pendingCases: 0,
      };
      existing.totalCases = item.totalCases || 0;
      existing.pendingCases = item.pendingCases || 0;
      districtMap.set(item._id, existing);
    }

    return Array.from(districtMap.values()).sort((a, b) => a.district.localeCompare(b.district));
  }
}

export const dashboardService = new DashboardService();
