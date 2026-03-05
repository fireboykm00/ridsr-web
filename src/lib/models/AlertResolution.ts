import mongoose, { Document, Schema } from 'mongoose';

export interface IAlertResolution extends Document {
  alertId: string;
  signature: string;
  district: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  triggerDate: Date;
  resolvedBy?: string;
  resolvedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AlertResolutionSchema = new Schema<IAlertResolution>(
  {
    alertId: { type: String, required: true, index: true },
    signature: { type: String, required: true },
    district: { type: String, required: true, index: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    triggerDate: { type: Date, required: true },
    resolvedBy: { type: String },
    resolvedAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

AlertResolutionSchema.index({ alertId: 1, signature: 1 }, { unique: true });

if (process.env.NODE_ENV !== 'production' && mongoose.models.AlertResolution) {
  delete mongoose.models.AlertResolution;
}

export const AlertResolution =
  mongoose.models.AlertResolution ||
  mongoose.model<IAlertResolution>('AlertResolution', AlertResolutionSchema);
