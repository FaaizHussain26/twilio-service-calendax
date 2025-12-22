import mongoose, { Schema, Document } from "mongoose";

export interface IPatientTranscriptDetails extends Document {
  [key: string]: any;
  createdAt?: Date;
  updatedAt?: Date;
}

const PatientTranscriptDetails: Schema = new Schema(
  {},
  { strict: false, timestamps: true }
);


export default mongoose.model<IPatientTranscriptDetails>(
  "patient-transcript-details",
  PatientTranscriptDetails
);
