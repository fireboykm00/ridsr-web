import mongoose, { Schema, Document } from "mongoose";
import { FacilityType, RwandaDistrictType, RwandaProvinceType } from "@/types";

export interface IFacility extends Document {
  name: string;
  code: string;
  type: FacilityType;
  district: RwandaDistrictType;
  province: RwandaProvinceType;
  contactPerson?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FacilitySchema = new Schema<IFacility>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    type: {
      type: String,
      required: true,
    },
    district: { type: String, required: true },
    province: { type: String, required: true },
    contactPerson: String,
    phone: String,
    email: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Facility =
  mongoose.models.Facility ||
  mongoose.model<IFacility>("Facility", FacilitySchema);
