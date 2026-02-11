import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  workerId: string;
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'NATIONAL_OFFICER' | 'DISTRICT_OFFICER' | 'HEALTH_WORKER' | 'LAB_TECHNICIAN';
  facilityId?: mongoose.Types.ObjectId;
  district?: string;
  province?: string;
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
      enum: ['ADMIN', 'NATIONAL_OFFICER', 'DISTRICT_OFFICER', 'HEALTH_WORKER', 'LAB_TECHNICIAN'],
      required: true,
    },
    facilityId: { type: Schema.Types.ObjectId, ref: 'Facility' },
    district: String,
    province: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
