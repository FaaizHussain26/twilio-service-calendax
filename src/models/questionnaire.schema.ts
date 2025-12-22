import mongoose, { Document, Schema } from "mongoose";

export interface QuestionnaireDocument extends Document {
  protocol_id: string;
  indication: string;
  questionnaire: string;
  is_approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionnaireSchema = new Schema<QuestionnaireDocument>(
  {
    protocol_id: { type: String, required: true },
    indication: { type: String, required: true },
    questionnaire: { type: String, required: true },
    is_approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<QuestionnaireDocument>(
  "questionnaires",
  QuestionnaireSchema
);
