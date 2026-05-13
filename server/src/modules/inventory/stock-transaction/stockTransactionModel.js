import mongoose from "mongoose";

const stockTransactionSchema = new mongoose.Schema(
  {
    transactionType: {
      type: String,
      enum: ["inbound", "outbound"],
      required: true,
      index: true,
    },
    entryNo: {
      type: String,
      trim: true,
      required: true,
    },
    goodsItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GoodsList",
      required: true,
      index: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
      index: true,
    },
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
    warehouseName: {
      type: String,
      trim: true,
      default: "",
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.000001,
    },
    partnerName: {
      type: String,
      trim: true,
      default: "",
    },
    transactionDate: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      trim: true,
      default: "Pending",
    },
    notes: {
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
    collection: "inventory_stock_transactions",
  },
);

stockTransactionSchema.index(
  { transactionType: 1, entryNo: 1 },
  { unique: true },
);
stockTransactionSchema.index({ createdAt: -1 });

const StockTransaction =
  mongoose.models.StockTransaction ||
  mongoose.model("StockTransaction", stockTransactionSchema);

export default StockTransaction;
