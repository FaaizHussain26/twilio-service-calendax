import mongoose from "mongoose";

const ManualScreeningSchema = new mongoose.Schema({
  protocol_id: { type: String, required: true, index: true },
  session_id: { type: String, required: true, index: true },
  conversation: [
    {
      role: { type: String, enum: ["user", "assistant"], required: true },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.model("manual_screening", ManualScreeningSchema);
