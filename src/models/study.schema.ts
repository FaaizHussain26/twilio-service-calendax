import mongoose, { Schema, Document } from 'mongoose';

export interface IStudy extends Document {
  studyID: string;
  protocolNumber: string;
  indication: string;
  status: string;
  PI: string;
  createdBy: mongoose.Types.ObjectId;
}

const StudySchema: Schema = new Schema({
  studyID: { type: String, required: true, unique: true },
  protocolNumber: { type: String, required: true },
  indication: { type: String, required: true },
  status: { type: String, required: true },
  PI: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.model<IStudy>('studies', StudySchema);
