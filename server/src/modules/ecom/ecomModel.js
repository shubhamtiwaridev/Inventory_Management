import mongoose from "mongoose";

const ecomProductSchema = new mongoose.Schema(
  {
    productSku: { type: String, trim: true, default: "" },
    title: { type: String, trim: true, default: "" },
    listingId: { type: String, trim: true, default: "" },
    channel: { type: String, trim: true, default: "" },
    price: { type: Number, default: 0 },
    stockQuantity: { type: Number, default: 0 },
    description: { type: String, trim: true, default: "" },
    createdBy: { type: String, trim: true, default: "System" },
    updatedBy: { type: String, trim: true, default: "System" },
  },
  {
    timestamps: true,
    collection: "ecom_products",
  },
);

ecomProductSchema.index(
  { productSku: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { productSku: { $type: "string", $ne: "" } },
  },
);

ecomProductSchema.index({ createdAt: -1 });

const EcomProduct =
  mongoose.models.EcomProduct ||
  mongoose.model("EcomProduct", ecomProductSchema);

export default EcomProduct;
