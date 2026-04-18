import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    createdBy: {
      type: String,
      trim: true,
      default: "System",
    },
  },
  {
    timestamps: true,
  },
);

const Department = mongoose.model("Department", departmentSchema);

export default Department;
