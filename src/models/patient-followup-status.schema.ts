import mongoose, { Schema, Document } from "mongoose";

export interface IPatientFollowupStatus extends Document {
  followup_id: string;
  patient_id: number;
  patient_contactno: string;
  agent_id: string;
  conversation_id: string;
  call_status: boolean;
  shift: string;
  transcript: string;
  summary: string;
  summary_title: string;
  time_utc: Date;
  call_dusation_secs?: number;
  system_prompt: string;
  is_crc_approved: boolean;
  crc_approved_datetime?: Date;
  iseligible: boolean;
  followup_type:
    | "initial"
    | "reminder"
    | "reschedule"
    | "confirmation"
    | "followup";
  followup_status:
    | "scheduled"
    | "completed"
    | "cancelled"
    | "rescheduled"
    | "no_answer"
    | "busy"
    | "failed";
  next_followup_date?: Date;
  notes?: string;
  appointment_id?: mongoose.Types.ObjectId;
  lead_id?: mongoose.Types.ObjectId;
  study_id?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const PatientFollowupStatusSchema: Schema = new Schema(
  {
    patient_id: {
      type: Number,
      required: true,
    },
    patient_contactno: {
      type: String,
      required: true,
    },
    agent_id: {
      type: String,
      required: true,
    },
    conversation_id: {
      type: String,
      required: true,
      unique: true,
    },
    call_status: {
      type: Boolean,
      required: true,
      default: false,
    },
    iseligible: {
      type: Boolean,
      required: true,
      default: false,
    },
    shift: {
      type: String,
      required: true,
      enum: ["Morning", "Afternoon", "Evening", "Night"],
    },
    transcript: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    summary_title: {
      type: String,
      required: true,
    },
    time_utc: {
      type: Date,
      required: true,
    },
    call_duration_secs: {
      type: Number,
      default: null,
    },
    system_prompt: {
      type: String,
      required: true,
    },
    is_crc_approved: {
      type: Boolean,
      default: false,
    },
    crc_approved_datetime: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "patient_followup_status",
  }
);

// Indexes for better query performance
PatientFollowupStatusSchema.index({ patient_id: 1 });
PatientFollowupStatusSchema.index({ patient_contactno: 1 });
PatientFollowupStatusSchema.index({ time_utc: 1 });

export default mongoose.model<IPatientFollowupStatus>(
  "patient_followup_status",
  PatientFollowupStatusSchema
);
