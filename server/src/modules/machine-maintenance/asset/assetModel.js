import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    assetCode: {
      type: String,
      required: [true, "Asset code is required"],
      unique: true,
      trim: true,
    },
    assetName: {
      type: String,
      required: [true, "Asset name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    plant: {
      type: String,
      required: [true, "Plant is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    manufacturer: {
      type: String,
      required: [true, "Manufacturer is required"],
      trim: true,
    },
    modelNumber: {
      type: String,
      trim: true,
      default: "",
    },
    serialNumber: {
      type: String,
      required: [true, "Serial number is required"],
      trim: true,
    },
    commissioningDate: {
      type: Date,
      default: null,
    },
    purchaseDate: {
      type: Date,
      default: null,
    },
    warrantyStart: {
      type: Date,
      default: null,
    },
    warrantyEnd: {
      type: Date,
      default: null,
    },
    criticality: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      default: "Running",
      trim: true,
    },
    powerRating: {
      type: String,
      trim: true,
      default: "",
    },
    technicalSpecifications: {
      type: String,
      trim: true,
      default: "",
    },
    operatingManual: {
      type: String,
      trim: true,
      default: "",
    },
    machineImage: {
      type: String,
      trim: true,
      default: "",
    },
    qrCode: {
      type: String,
      trim: true,
      default: "",
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

const Asset = mongoose.model("MachineMaintenanceAsset", assetSchema);

export default Asset;
