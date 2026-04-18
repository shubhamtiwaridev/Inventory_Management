import mongoose from "mongoose";

const shiftTimingSchema = new mongoose.Schema(
  {
    fromTime: {
      type: String,
      trim: true,
      default: "",
    },
    toTime: {
      type: String,
      trim: true,
      default: "",
    },
    shiftTiming: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    shiftFrom: {
      type: String,
      trim: true,
      default: "",
    },
    shiftTo: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: String,
      trim: true,
      default: "System",
    },
  },
  {
    timestamps: true,
    collection: "configure_shift_timings",
  },
);

const ShiftTiming =
  mongoose.models.ConfigureShiftTiming ||
  mongoose.model("ConfigureShiftTiming", shiftTimingSchema);

export default ShiftTiming;
