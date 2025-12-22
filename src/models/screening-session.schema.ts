import mongoose, { Schema, Document } from 'mongoose';

export interface IScreeningSession extends Document {
  sessionID: string;
  leadID: mongoose.Types.ObjectId;
  studyID: mongoose.Types.ObjectId;
  answers: { question: string; response: string }[];
  outcome: string;
  timestampStart: Date;
  timestampEnd: Date;
}

const ScreeningSessionSchema: Schema = new Schema({
  sessionID: { type: String, required: true, unique: true },
  leadID: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  studyID: { type: Schema.Types.ObjectId, ref: 'Study', required: true },
  answers: [{ question: String, response: String }],
  outcome: { type: String, required: true },
  timestampStart: { type: Date, required: true },
  timestampEnd: { type: Date, required: true },
});

export default mongoose.model<IScreeningSession>('screening-sessions', ScreeningSessionSchema);
