import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  nationalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  email?: string;
  address: {
    street: string;
    sector: string;
    district: string;
    province: string;
    country: string;
  };
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
      enum: ['MALE', 'FEMALE', 'OTHER'],
      required: true,
    },
    phone: { type: String, required: true },
    email: String,
    address: {
      street: String,
      sector: String,
      district: String,
      province: String,
      country: String,
    },
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
