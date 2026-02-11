import mongoose, { Schema, Document } from 'mongoose';

export interface IThresholdRule extends Document {
  diseaseCode: string;
  location: string;
  threshold: number;
  timeWindowHours: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ThresholdRuleSchema = new Schema<IThresholdRule>(
  {
    diseaseCode: { type: String, required: true },
    location: { type: String, required: true },
    threshold: { type: Number, required: true },
    timeWindowHours: { type: Number, required: true },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ThresholdRule = mongoose.models.ThresholdRule || mongoose.model<IThresholdRule>('ThresholdRule', ThresholdRuleSchema);
