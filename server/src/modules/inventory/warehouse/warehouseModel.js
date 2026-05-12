import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema(
  {
    warehouseCode: {
      type: String,
      trim: true,
      default: "",
    },
    warehouseName: {
      type: String,
      trim: true,
      required: true,
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: String,
      trim: true,
      default: "System",
    },
    updatedBy: {
      type: String,
      trim: true,
      default: "System",
    },
  },
  {
    timestamps: true,
    collection: "inventory_warehouses",
  },
);

warehouseSchema.index(
  { warehouseCode: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { warehouseCode: { $type: "string", $ne: "" } },
  },
);
warehouseSchema.index(
  { warehouseName: 1 },
  {
    unique: true,
    partialFilterExpression: { warehouseName: { $type: "string", $ne: "" } },
  },
);
warehouseSchema.index({ createdAt: -1 });

const Warehouse =
  mongoose.models.Warehouse || mongoose.model("Warehouse", warehouseSchema);

export default Warehouse;
