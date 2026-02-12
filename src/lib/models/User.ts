import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, USER_ROLES, RwandaDistrictType, RwandaProvinceType } from '@/types';

export interface IUser extends Document {
  workerId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  facilityId?: mongoose.Types.ObjectId;
  facilityName?: string;
  district?: RwandaDistrictType;
  province?: RwandaProvinceType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    workerId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },
    facilityId: { type: Schema.Types.ObjectId, ref: 'Facility' },
    facilityName: String,
    district: String,
    province: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
