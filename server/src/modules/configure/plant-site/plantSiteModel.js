import mongoose from "mongoose";

const plantSiteSchema = new mongoose.Schema(
  {
    plantSite: {
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

const PlantSite = mongoose.model("PlantSite", plantSiteSchema);

export default PlantSite;
