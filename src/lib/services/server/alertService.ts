import { dbConnect } from '@/lib/services/db';
import { AlertResolution, Case as CaseModel, Facility as FacilityModel } from '@/lib/models';
import { RwandaDistrictType, UserRole } from '@/types';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AlertRecord {
  id: string;
  signature: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: 'active' | 'resolved';
  triggerDate: Date;
  district: string;
  resolvedAt?: Date;
}

interface UserContext {
  id?: string;
  role: UserRole;
  facilityId?: string;
  district?: RwandaDistrictType;
}

interface AlertQueryOptions {
  district?: string;
  severity?: AlertSeverity;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
}

function getSeverity(totalCases: number, pendingCases: number): AlertSeverity {
  if (pendingCases >= 25 || totalCases >= 60) return 'critical';
  if (pendingCases >= 15 || totalCases >= 40) return 'high';
  if (pendingCases >= 8 || totalCases >= 20) return 'medium';
  return 'low';
}

export class AlertService {
  private async getRoleScopedDistrict(user: UserContext): Promise<string | undefined> {
    if (user.role === 'district_officer' && user.district) {
      return user.district;
    }

    if ((user.role === 'health_worker' || user.role === 'lab_technician') && user.facilityId) {
      await dbConnect();
      const facility = await FacilityModel.findById(user.facilityId).select('district').lean();
      return facility?.district;
    }

    return undefined;
  }

  async getGeneratedAlerts(user: UserContext, options: AlertQueryOptions = {}): Promise<AlertRecord[]> {
    await dbConnect();
    const roleDistrict = await this.getRoleScopedDistrict(user);
    const districtMatch = options.district || roleDistrict;

    const match: Record<string, unknown> = {};
    if (options.dateFrom || options.dateTo) {
      match.reportDate = {
        ...(options.dateFrom ? { $gte: options.dateFrom } : {}),
        ...(options.dateTo ? { $lte: options.dateTo } : {}),
      };
    }

    const aggregated = await CaseModel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'facilities',
          localField: 'facilityId',
          foreignField: '_id',
          as: 'facility',
        },
      },
      { $unwind: '$facility' },
      ...(districtMatch ? [{ $match: { 'facility.district': districtMatch } }] : []),
      {
        $group: {
          _id: '$facility.district',
          totalCases: { $sum: 1 },
          pendingCases: {
            $sum: { $cond: [{ $eq: ['$validationStatus', 'pending'] }, 1, 0] },
          },
          latestDate: { $max: '$reportDate' },
        },
      },
      { $sort: { pendingCases: -1, totalCases: -1 } },
      ...(options.limit ? [{ $limit: options.limit }] : []),
    ]);

    return aggregated
      .map((item) => {
        const severity = getSeverity(item.totalCases || 0, item.pendingCases || 0);
        const signature = `${item._id}:${severity}:${item.pendingCases || 0}:${item.totalCases || 0}`;
        return {
          id: `district-${item._id}`,
          signature,
          title: `Surveillance pressure in ${item._id}`,
          description: `${item.pendingCases || 0} pending validations out of ${item.totalCases || 0} reported cases.`,
          severity,
          status: 'active' as const,
          triggerDate: item.latestDate || new Date(),
          district: item._id,
        };
      })
      .filter((alert) => (options.severity ? alert.severity === options.severity : alert.severity !== 'low'));
  }

  async getResolvedAlerts(user: UserContext, options: AlertQueryOptions = {}): Promise<AlertRecord[]> {
    await dbConnect();
    const roleDistrict = await this.getRoleScopedDistrict(user);
    const districtMatch = options.district || roleDistrict;

    const query: Record<string, unknown> = {};
    if (districtMatch) query.district = districtMatch;
    if (options.severity) query.severity = options.severity;
    if (options.dateFrom || options.dateTo) {
      query.resolvedAt = {
        ...(options.dateFrom ? { $gte: options.dateFrom } : {}),
        ...(options.dateTo ? { $lte: options.dateTo } : {}),
      };
    }

    const docs = await AlertResolution.find(query)
      .sort({ resolvedAt: -1 })
      .limit(options.limit || 200)
      .lean();

    return docs.map((doc) => ({
      id: doc.alertId,
      signature: doc.signature,
      title: doc.title,
      description: doc.description,
      severity: doc.severity,
      status: 'resolved' as const,
      triggerDate: doc.triggerDate,
      district: doc.district,
      resolvedAt: doc.resolvedAt,
    }));
  }

  async getActiveAlerts(user: UserContext, options: AlertQueryOptions = {}): Promise<AlertRecord[]> {
    const generated = await this.getGeneratedAlerts(user, options);
    if (!generated.length) return [];

    await dbConnect();
    const resolutionQuery = {
      $or: generated.map((alert) => ({ alertId: alert.id, signature: alert.signature })),
    };
    const resolved = await AlertResolution.find(resolutionQuery).select('alertId signature').lean();
    const resolvedKeys = new Set(resolved.map((doc) => `${doc.alertId}:${doc.signature}`));

    return generated.filter((alert) => !resolvedKeys.has(`${alert.id}:${alert.signature}`));
  }

  async resolveAlert(user: UserContext, payload: {
    alertId: string;
    signature: string;
    district: string;
    severity: AlertSeverity;
    title: string;
    description: string;
    triggerDate: string | Date;
  }) {
    await dbConnect();
    return AlertResolution.findOneAndUpdate(
      { alertId: payload.alertId, signature: payload.signature },
      {
        alertId: payload.alertId,
        signature: payload.signature,
        district: payload.district,
        severity: payload.severity,
        title: payload.title,
        description: payload.description,
        triggerDate: new Date(payload.triggerDate),
        resolvedBy: user.id,
        resolvedAt: new Date(),
      },
      { upsert: true, new: true },
    ).lean();
  }

  async countActiveAlerts(user: UserContext, options: AlertQueryOptions = {}): Promise<number> {
    const alerts = await this.getActiveAlerts(user, options);
    return alerts.length;
  }
}

export const alertService = new AlertService();
