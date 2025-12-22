import mongoose, { Schema, Document } from "mongoose";

export interface IUploadedProtocolDetails extends Document {
  pi: string;
  indication: string;
  enrollment_startDate: Date;
  is_updated: boolean;
  protocol_id: string;
  site_id: string;
  file: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const UploadedProtocolDetailsSchema: Schema = new Schema(
  {
    pi: { type: String, required: true },
    indication: { type: String, required: true },
    enrollment_startDate: { type: Date, required: true },
    is_updated: { type: Boolean, required: true },
    protocol_id: { type: String, required: true },
    site_id: { type: String, required: true },
    file: {
      type: Schema.Types.ObjectId,
      ref: "uploaded-files",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUploadedProtocolDetails>(
  "uploaded-protocol-details",
  UploadedProtocolDetailsSchema
);
