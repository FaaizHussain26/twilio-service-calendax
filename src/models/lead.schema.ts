import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  leadID: string;
  name: string;
  contactInfo: string;
  source: string;
  preferredChannel: string;
  studyID: mongoose.Types.ObjectId;
}

const LeadSchema: Schema = new Schema({
  leadID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contactInfo: { type: String, required: true },
  source: { type: String, required: true },
  preferredChannel: { type: String, required: true },
  studyID: { type: Schema.Types.ObjectId, ref: 'Study', required: true },
});

export default mongoose.model<ILead>('leads', LeadSchema);
