import mongoose, { Schema, Document } from 'mongoose';
import {
  ValidationStatus,
  OutcomeStatus,
  CaseStatus,
  DiseaseCode,
  Symptom,
  LabResultInterpretation,
} from '@/types';

export interface ILabResultSubdoc {
  _id?: mongoose.Types.ObjectId;
  testType: string;
  testName: string;
  testDate: Date;
  resultValue: string;
  interpretation: LabResultInterpretation;
  resultUnit?: string;
  referenceRange?: string;
  technicianId: mongoose.Types.ObjectId;
  validatedBy?: mongoose.Types.ObjectId;
  validatedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

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
  labResults: ILabResultSubdoc[];
  createdAt: Date;
  updatedAt: Date;
}

const LabResultSchema = new Schema<ILabResultSubdoc>(
  {
    testType: { type: String, required: true, trim: true },
    testName: { type: String, required: true, trim: true },
    testDate: { type: Date, required: true },
    resultValue: { type: String, required: true, trim: true },
    interpretation: {
      type: String,
      enum: ['positive', 'negative', 'equivocal', 'contaminated'],
      required: true,
    },
    resultUnit: { type: String, trim: true },
    referenceRange: { type: String, trim: true },
    technicianId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    validatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    validatedAt: { type: Date },
  },
  { _id: true, timestamps: true }
);

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
    labResults: { type: [LabResultSchema], default: [] },
  },
  { timestamps: true }
);

// In Next.js dev/HMR, mongoose model caching can keep an old schema version
// (without newly added fields like `labResults`). Re-register to ensure schema parity.
if (process.env.NODE_ENV !== 'production' && mongoose.models.Case) {
  delete mongoose.models.Case;
}

export const Case = mongoose.models.Case || mongoose.model<ICase>('Case', CaseSchema);
