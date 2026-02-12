import mongoose, { Schema, Document } from 'mongoose';
import { Gender, RwandaDistrictType, RwandaProvinceType } from '@/types';

export interface IPatient extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    nationalId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    phone: { type: String, required: true },
    address: {
      street: String,
      sector: String,
      district: String,
      province: String,
      country: { type: String, default: 'Rwanda' },
    },
    district: { type: String, required: true },
    occupation: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
  },
  { timestamps: true }
);

export const Patient = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
