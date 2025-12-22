import mongoose, { Schema, Document } from "mongoose";

export interface IOutcomeLeads extends Document {
  [key: string]: any;

  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;

  ipAddress?: string;
  lastModifiedIp?: string;
  deletedFromIp?: string;

  userAgent?: string;

  isDeleted?: boolean;
  deletedAt?: Date;

  lastModifiedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

const OutcomeLeadsSchema: Schema = new Schema(
  {
    // Audit trail fields
    createdBy: {
      type: String,
      required: false,
      index: true,
    },
    updatedBy: {
      type: String,
      required: false,
    },
    deletedBy: {
      type: String,
      required: false,
    },

    // IP address tracking
    ipAddress: {
      type: String,
      required: false,
    },
    lastModifiedIp: {
      type: String,
      required: false,
    },
    deletedFromIp: {
      type: String,
      required: false,
    },

    // User agent
    userAgent: {
      type: String,
      required: false,
    },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      required: false,
    },

    lastModifiedAt: {
      type: Date,
      required: false,
    },
  },
  {
    strict: false,

    timestamps: true,

    collection: "outcome-leads",
  }
);

OutcomeLeadsSchema.index({ createdAt: -1 });
OutcomeLeadsSchema.index({ updatedAt: -1 });
OutcomeLeadsSchema.index({ isDeleted: 1, createdAt: -1 });
OutcomeLeadsSchema.index({ createdBy: 1, createdAt: -1 });

OutcomeLeadsSchema.pre("save", function (next) {
  if (this.isNew && !this.createdBy) {
    this.createdBy = "system";
  }

  next();
});

OutcomeLeadsSchema.pre("findOneAndUpdate", function (next) {
  this.set({ lastModifiedAt: new Date() });
  next();
});

OutcomeLeadsSchema.methods.toSanitizedObject = function () {
  const obj = this.toObject();

  delete obj.__v;

  return obj;
};

OutcomeLeadsSchema.statics.findActive = function (query = {}) {
  return this.find({ ...query, isDeleted: { $ne: true } });
};

export default mongoose.model<IOutcomeLeads>(
  "outcome-leads",
  OutcomeLeadsSchema
);
