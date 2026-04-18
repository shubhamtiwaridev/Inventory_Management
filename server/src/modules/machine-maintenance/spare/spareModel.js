import mongoose from "mongoose";

const spareSchema = new mongoose.Schema(
  {
    spareCode: {
      type: String,
      required: [true, "Spare code is required"],
      unique: true,
      trim: true,
    },
    spareName: {
      type: String,
      required: [true, "Spare name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    linkedMachine: {
      type: String,
      trim: true,
      default: "",
    },
    partCategory: {
      type: String,
      trim: true,
      default: "",
    },
    vendor: {
      type: String,
      required: [true, "Vendor is required"],
      trim: true,
    },
    partNo: {
      type: String,
      required: [true, "Part number is required"],
      trim: true,
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      trim: true,
    },
    reorderLevel: {
      type: Number,
      default: 0,
    },
    minQty: {
      type: Number,
      required: [true, "Minimum quantity is required"],
      default: 0,
    },
    maxQty: {
      type: Number,
      required: [true, "Maximum quantity is required"],
      default: 0,
    },
    currentStock: {
      type: Number,
      default: 0,
    },
    leadTime: {
      type: Number,
      default: 0,
    },
    costPerUnit: {
      type: Number,
      default: 0,
    },
    alternatePart: {
      type: String,
      trim: true,
      default: "",
    },
    shelfLocation: {
      type: String,
      trim: true,
      default: "",
    },
    batchNo: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      default: "Active",
      trim: true,
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

const Spare = mongoose.model("MachineMaintenanceSpare", spareSchema);

export default Spare;
