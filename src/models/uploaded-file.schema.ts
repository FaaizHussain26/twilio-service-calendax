import mongoose, { Document, Schema } from "mongoose";

export interface IUploadedFile extends Document {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  protocol_id: string;
  uploadedAt: Date;
}

const UploadedFileSchema = new Schema<IUploadedFile>(
  {
    filename: { type: String, required: true },
    originalname: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    protocol_id: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IUploadedFile>(
  "uploaded-files",
  UploadedFileSchema
);
