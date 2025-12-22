import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  appointmentID: string;
  scheduledTime: Date;
  status: string;
  leadID: mongoose.Types.ObjectId;
  screeningSessionID: mongoose.Types.ObjectId;
}

const AppointmentSchema: Schema = new Schema({
  appointmentID: { type: String, required: true, unique: true },
  scheduledTime: { type: Date, required: true },
  status: { type: String, required: true },
  leadID: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  screeningSessionID: { type: Schema.Types.ObjectId, ref: 'ScreeningSession', required: true },
});

export default mongoose.model<IAppointment>('appointments', AppointmentSchema);
