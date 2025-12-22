import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  appointmentID: string;
  leadID: mongoose.Types.ObjectId;
  studyID: mongoose.Types.ObjectId;
  sessionID: mongoose.Types.ObjectId;
  scheduledTime: Date;
  status: string;
  bookedBy: mongoose.Types.ObjectId;
}

const AppointmentSchema: Schema = new Schema({
  appointmentID: { type: String, required: true, unique: true },
  leadID: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  studyID: { type: Schema.Types.ObjectId, ref: 'Study', required: true },
  sessionID: { type: Schema.Types.ObjectId, ref: 'ScreeningSession', required: true },
  scheduledTime: { type: Date, required: true },
  status: { type: String, required: true },
  bookedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.model<IAppointment>('appointments', AppointmentSchema);
