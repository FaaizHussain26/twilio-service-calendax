import mongoose, { Document, Schema } from "mongoose";

export interface IPatientQuestions extends Document {
  // Form data from interest form
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNo1: string;
  phoneNo2?: string;
  email?: string;
  dateOfBirth?: string;
  studyOfInterest: string[];
  submittedBy: string;
  bestTimeToCall?: string[];
  mailingAddress?: string;
  streetAddress?: string;
  apartmentNumber?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  specialInstruction?: string;
  acceptTerms: boolean;
  // patient_id
  patientId?: string;
  userId?: number;

  // Generated questions
  questions: string;
  siteVisitQuestion: string;
  siteId: Number;

  // Protocol information
  protocol_id?: string;
  protocol_name?: string;
  indication?: string;
  status?: boolean;
  sitevisit_call_status?: boolean,
  conversation_id?: string,
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

const PatientQuestionsSchema = new Schema<IPatientQuestions>(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    phoneNo1: { type: String, required: true },
    phoneNo2: { type: String },
    email: { type: String },
    dateOfBirth: { type: String },
    studyOfInterest: { type: [String], required: true },
    submittedBy: { type: String, required: true },
    bestTimeToCall: { type: [String] },
    mailingAddress: { type: String },
    streetAddress: { type: String },
    apartmentNumber: { type: String },
    state: { type: String },
    city: { type: String },
    zipCode: { type: String },
    specialInstruction: { type: String },
    acceptTerms: { type: Boolean, required: true },
    patientId: { type: String },
    userId: { type: Number },

    questions: { type: String, required: true },
    siteVisitQuestion: { type: String, default: null },
    siteId: { type: Number, default: null },
    conversation_id: { type: String, default: null },
    sitevisit_call_status: { type: Boolean, default: false },

    protocol_id: { type: String },
    protocol_name: { type: String },
    indication: { type: String },
    status: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IPatientQuestions>(
  "patient-questions",
  PatientQuestionsSchema
);
