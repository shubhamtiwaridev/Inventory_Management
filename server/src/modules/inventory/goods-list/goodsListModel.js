import mongoose from "mongoose";

const goodsListSchema = new mongoose.Schema(
  {
    goodsCode: {
      type: String,
      trim: true,
      default: "",
    },
    goodsDesc: {
      type: String,
      trim: true,
      default: "",
    },
    goodsSupplier: {
      type: String,
      trim: true,
      default: "",
    },
    goodsSku: {
      type: String,
      trim: true,
      default: "",
    },
    goodsBarcode: {
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
    collection: "inventory_goods_list",
  },
);

goodsListSchema.index(
  { goodsCode: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { goodsCode: { $type: "string", $ne: "" } },
  },
);
goodsListSchema.index(
  { goodsSku: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { goodsSku: { $type: "string", $ne: "" } },
  },
);
goodsListSchema.index(
  { goodsBarcode: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { goodsBarcode: { $type: "string", $ne: "" } },
  },
);
goodsListSchema.index({ createdAt: -1 });

const GoodsList =
  mongoose.models.GoodsList ||
  mongoose.model("GoodsList", goodsListSchema);

export default GoodsList;
