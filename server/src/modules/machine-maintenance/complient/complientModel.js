import mongoose from "mongoose";

const complientSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      enum: ["assets", "spare", "task-master", "vendor-supplier"],
      trim: true,
    },
    complaintCode: {
      type: String,
      required: [true, "Complaint code is required"],
      unique: true,
      trim: true,
    },
    complaintTitle: {
      type: String,
      required: [true, "Complaint title is required"],
      trim: true,
    },
    assetName: {
      type: String,
      trim: true,
      default: "",
    },
    spareName: {
      type: String,
      trim: true,
      default: "",
    },
    taskName: {
      type: String,
      trim: true,
      default: "",
    },
    vendorName: {
      type: String,
      trim: true,
      default: "",
    },
    issueDate: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      trim: true,
      default: "Medium",
    },
    status: {
      type: String,
      trim: true,
      default: "Open",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    resolvedBy: {
      type: String,
      trim: true,
      default: "",
    },
    resolvedDate: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: String,
      trim: true,
      default: "",
    },
    updatedBy: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

complientSchema.index({ section: 1, createdAt: -1 });

const Complient = mongoose.model("MachineMaintenanceComplient", complientSchema);

export default Complient;
