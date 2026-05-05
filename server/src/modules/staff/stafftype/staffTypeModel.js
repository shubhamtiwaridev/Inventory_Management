import mongoose from "mongoose";

const staffTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    assignedCards: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    }],
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

staffTypeSchema.index({ createdAt: -1 });

const StaffType = mongoose.model("StaffType", staffTypeSchema);

export default StaffType;
