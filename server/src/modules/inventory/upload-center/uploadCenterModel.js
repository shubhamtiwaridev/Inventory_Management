import mongoose from "mongoose";

const uploadCenterFileSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      trim: true,
      required: true,
    },
    storedName: {
      type: String,
      trim: true,
      required: true,
    },
    mimeType: {
      type: String,
      trim: true,
      default: "application/octet-stream",
    },
    sizeBytes: {
      type: Number,
      default: 0,
    },
    extension: {
      type: String,
      trim: true,
      default: "",
    },
    relativePath: {
      type: String,
      trim: true,
      required: true,
    },
    createdBy: {
      type: String,
      trim: true,
      default: "System",
    },
    updatedBy: {
      type: String,
      trim: true,
      default: "System",
    },
  },
  {
    timestamps: true,
    collection: "inventory_upload_center_files",
  },
);

uploadCenterFileSchema.index({ createdAt: -1 });

const UploadCenterFile =
  mongoose.models.UploadCenterFile ||
  mongoose.model("UploadCenterFile", uploadCenterFileSchema);

export default UploadCenterFile;
