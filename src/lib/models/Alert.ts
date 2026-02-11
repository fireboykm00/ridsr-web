import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  diseaseCode: string;
  location: string;
  caseCount: number;
  threshold: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED';
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    diseaseCode: { type: String, required: true },
    location: { type: String, required: true },
    caseCount: { type: Number, required: true },
    threshold: { type: Number, required: true },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'RESOLVED', 'ACKNOWLEDGED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

export const Alert = mongoose.models.Alert || mongoose.model<IAlert>('Alert', AlertSchema);
