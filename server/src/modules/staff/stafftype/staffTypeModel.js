import mongoose from "mongoose";

const staffTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const StaffType = mongoose.model("StaffType", staffTypeSchema);

export default StaffType;