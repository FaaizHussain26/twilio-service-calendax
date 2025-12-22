import mongoose, { Document, Schema } from "mongoose";

export interface IProtocolDocument extends Document {
  text: string;
  embedding: number[];
  page: number;
  chunk: number;
  protocol_id: string;
  site_id: string;
  file_id: mongoose.Types.ObjectId;
}

const ProtocolDocumentSchema = new Schema<IProtocolDocument>(
  {
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    page: { type: Number, required: true },
    chunk: { type: Number, required: true },
    protocol_id: { type: String, required: true, index: true },
    site_id: { type: String, required: true, index: true },
    file_id: {
      type: Schema.Types.ObjectId,
      ref: "uploaded-files",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IProtocolDocument>(
  "protocol-documents",
  ProtocolDocumentSchema
);
