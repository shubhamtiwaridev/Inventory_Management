import mongoose from "mongoose";

const userAllocationSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      default: "",
    },
    skillSet: {
      type: String,
      trim: true,
      default: "",
    },
    shift: {
      type: String,
      enum: ["", "Morning", "Evening", "Night", "General"],
      default: "",
      trim: true,
    },
    mobileNumber: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    supervisor: {
      type: String,
      trim: true,
      default: "",
    },
    machine: {
      type: String,
      trim: true,
      default: "",
    },
    task: {
      type: String,
      trim: true,
      default: "",
    },
    accessRights: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "Active",
        "Pending",
        "Running",
        "Idle",
        "Under Maintenance",
        "Breakdown",
        "Retired",
      ],
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

const UserAllocation = mongoose.model(
  "MachineMaintenanceUserAllocation",
  userAllocationSchema,
);

export default UserAllocation;
