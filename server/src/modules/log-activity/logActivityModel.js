import mongoose from "mongoose";

const logActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userName: {
      type: String,
      trim: true,
      default: "Guest",
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    role: {
      type: String,
      trim: true,
      default: "",
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      trim: true,
      default: "",
    },
    page: {
      type: String,
      trim: true,
      default: "",
    },
    resource: {
      type: String,
      trim: true,
      default: "",
    },
    targetName: {
      type: String,
      trim: true,
      default: "",
    },
    method: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },
    endpoint: {
      type: String,
      trim: true,
      default: "",
    },
    statusCode: {
      type: Number,
      default: 0,
    },
    ipAddress: {
      type: String,
      trim: true,
      default: "",
    },
    userAgent: {
      type: String,
      trim: true,
      default: "",
    },
    details: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "log_activities",
  },
);

logActivitySchema.index({ createdAt: -1 });
logActivitySchema.index({ userEmail: 1, createdAt: -1 });
logActivitySchema.index({ module: 1, createdAt: -1 });
logActivitySchema.index({
  action: "text",
  module: "text",
  userName: "text",
  userEmail: "text",
});

const LogActivity =
  mongoose.models.LogActivity ||
  mongoose.model("LogActivity", logActivitySchema);

export default LogActivity;
