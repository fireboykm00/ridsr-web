import mongoose, { Schema, Document } from 'mongoose';

export interface ICase extends Document {
  patientId: mongoose.Types.ObjectId;
  facilityId: mongoose.Types.ObjectId;
  diseaseCode: string;
  symptoms: string[];
  onsetDate: Date;
  reportDate: Date;
  reporterId: mongoose.Types.ObjectId;
  validationStatus: 'PENDING' | 'VALIDATED' | 'REJECTED';
  isAlertTriggered: boolean;
  labResults?: string;
  outcome?: 'RECOVERED' | 'DIED' | 'ONGOING';
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema = new Schema<ICase>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    facilityId: { type: Schema.Types.ObjectId, ref: 'Facility', required: true },
    diseaseCode: { type: String, required: true },
    symptoms: [String],
    onsetDate: { type: Date, required: true },
    reportDate: { type: Date, required: true },
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    validationStatus: {
      type: String,
      enum: ['PENDING', 'VALIDATED', 'REJECTED'],
      default: 'PENDING',
    },
    isAlertTriggered: { type: Boolean, default: false },
    labResults: String,
    outcome: {
      type: String,
      enum: ['RECOVERED', 'DIED', 'ONGOING'],
    },
  },
  { timestamps: true }
);

export const Case = mongoose.models.Case || mongoose.model<ICase>('Case', CaseSchema);
