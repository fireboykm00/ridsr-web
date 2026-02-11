import mongoose, { Schema, Document } from 'mongoose';

export interface IFacility extends Document {
  name: string;
  type: 'HOSPITAL' | 'CLINIC' | 'HEALTH_CENTER' | 'LAB';
  district: string;
  province: string;
  coordinates?: { lat: number; lng: number };
  contactPerson: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FacilitySchema = new Schema<IFacility>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['HOSPITAL', 'CLINIC', 'HEALTH_CENTER', 'LAB'],
      required: true,
    },
    district: { type: String, required: true },
    province: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Facility = mongoose.models.Facility || mongoose.model<IFacility>('Facility', FacilitySchema);
