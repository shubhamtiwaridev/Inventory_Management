import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    vendorCode: {
      type: String,
      required: [true, "Vendor code is required"],
      unique: true,
      trim: true,
    },
    vendorName: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
    },
    contactPerson: {
      type: String,
      required: [true, "Contact person is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    contractType: {
      type: String,
      required: [true, "Contract type is required"],
      trim: true,
    },
    sla: {
      type: String,
      trim: true,
      default: "",
    },
    machinesCovered: {
      type: String,
      trim: true,
      default: "",
    },
    contractValidityFrom: {
      type: Date,
      default: null,
    },
    contractValidityTo: {
      type: Date,
      default: null,
    },
    escalationContacts: {
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

vendorSchema.index({ createdAt: -1 });

const Vendor = mongoose.model("MachineMaintenanceVendor", vendorSchema);

export default Vendor;
