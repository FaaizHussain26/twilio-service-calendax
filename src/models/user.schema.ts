import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: string;
  name: string;
  site_id: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    name: { type: String, required: true },
    site_id: { type: Schema.Types.ObjectId, ref: 'Site', required: false },
  },
  { timestamps: true } 
);

export default mongoose.model<IUser>('users', UserSchema);
