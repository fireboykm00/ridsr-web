import mongoose, { Schema, Document } from 'mongoose';
import { ValidationStatus, OutcomeStatus, CaseStatus, DiseaseCode, Symptom } from '@/types';

export interface ICase extends Document {
  patientId: mongoose.Types.ObjectId;
  facilityId: mongoose.Types.ObjectId;
  diseaseCode: DiseaseCode;
  symptoms: Symptom[];
  onsetDate: Date;
  reportDate: Date;
  reporterId: mongoose.Types.ObjectId;
  validationStatus: ValidationStatus;
  status: CaseStatus;
  outcome?: OutcomeStatus;
  validatorId?: mongoose.Types.ObjectId;
  validationDate?: Date;
  outcomeDate?: Date;
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
      enum: ['pending', 'validated', 'rejected'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: ['suspected', 'confirmed', 'resolved', 'invalidated'],
      default: 'suspected',
    },
    outcome: {
      type: String,
      enum: ['recovered', 'deceased', 'transferred', 'unknown'],
    },
    validatorId: { type: Schema.Types.ObjectId, ref: 'User' },
    validationDate: { type: Date },
    outcomeDate: { type: Date },
  },
  { timestamps: true }
);

export const Case = mongoose.models.Case || mongoose.model<ICase>('Case', CaseSchema);
