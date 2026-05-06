import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    path: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
      trim: true,
    },
    iconBg: {
      type: String,
      required: true,
      trim: true,
    },
    iconColor: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    subtitleTone: {
      type: String,
      enum: ["success", "error", "warning", "info"],
      default: "success",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    allowInStaffTypes: {
      type: Boolean,
      default: true,
    },
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

cardSchema.index({ createdAt: -1 });

const Card = mongoose.models.Card || mongoose.model("Card", cardSchema);

export default Card;
