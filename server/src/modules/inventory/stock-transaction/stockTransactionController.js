import GoodsList from "../goods-list/goodsListModel.js";
import Warehouse from "../warehouse/warehouseModel.js";
import StockTransaction from "./stockTransactionModel.js";

const STOCK_TRANSACTION_SELECT_FIELDS =
  "transactionType entryNo goodsItemId warehouseId goodsCode goodsDesc warehouseName unit quantity partnerName transactionDate status notes createdBy createdAt updatedAt";

const pad = (value) => String(value).padStart(2, "0");
const normalizeValue = (value) => String(value || "").trim();
const normalizeStatusValue = (value) => {
  const normalized = normalizeValue(value).toLowerCase();

  if (!normalized) return "Pending";

  return normalized
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatDateTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  const hours = date.getHours();
  const hours12 = hours % 12 || 12;
  const amPm = hours >= 12 ? "PM" : "AM";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${hours12}:${pad(date.getMinutes())} ${amPm}`;
};

const getUserName = (req) =>
  req.user?.name || req.user?.username || req.user?.email || "System";

const getTransactionType = (req) =>
  req.inventoryTransactionType === "outbound" ? "outbound" : "inbound";

const getEntryPrefix = (transactionType) =>
  transactionType === "outbound" ? "OUT" : "IN";

const mapTransactionItem = (item) => ({
  id: String(item._id),
  transactionType: item.transactionType || "inbound",
  entryNo: item.entryNo || "",
  goodsItemId: String(item.goodsItemId || ""),
  warehouseId: String(item.warehouseId || ""),
  goodsCode: item.goodsCode || "",
  goodsDesc: item.goodsDesc || "",
  warehouseName: item.warehouseName || "",
  quantity: String(item.quantity ?? ""),
  unit: item.unit || "",
  partnerName: item.partnerName || "",
  transactionDate: item.transactionDate || "",
  status: item.status || "Pending",
  notes: item.notes || "",
  createdBy: item.createdBy || "System",
  createdAt: formatDateTime(item.createdAt),
  updatedAt: formatDateTime(item.updatedAt),
});

const normalizeTransactionPayload = (payload = {}) => ({
  goodsItemId: normalizeValue(payload.goodsItemId),
  warehouseId: normalizeValue(payload.warehouseId),
  quantity: Number(payload.quantity),
  partnerName: normalizeValue(payload.partnerName),
  transactionDate: normalizeValue(payload.transactionDate),
  status: normalizeStatusValue(payload.status),
  notes: normalizeValue(payload.notes),
});

const getValidationError = (payload = {}) => {
  if (!normalizeValue(payload.goodsItemId)) {
    return "Goods item is required";
  }

  if (!normalizeValue(payload.warehouseId)) {
    return "Warehouse is required";
  }

  if (!Number.isFinite(payload.quantity) || payload.quantity <= 0) {
    return "Quantity must be greater than 0";
  }

  if (!normalizeValue(payload.partnerName)) {
    return "Partner name is required";
  }

  if (!normalizeValue(payload.transactionDate)) {
    return "Transaction date is required";
  }

  if (!normalizeValue(payload.status)) {
    return "Status is required";
  }

  return "";
};

const buildGoodsSnapshot = (goodsItem) => ({
  goodsItemId: goodsItem._id,
  goodsCode: normalizeValue(goodsItem.goodsCode),
  goodsDesc: normalizeValue(goodsItem.goodsDesc),
  unit: normalizeValue(goodsItem.goodsUnit),
});

const buildWarehouseSnapshot = (warehouse) => ({
  warehouseId: warehouse._id,
  warehouseName: normalizeValue(warehouse.warehouseName),
});

const getNextEntryNo = async (transactionType) => {
  const prefix = getEntryPrefix(transactionType);
  const latestItem = await StockTransaction.findOne({ transactionType })
    .sort({ createdAt: -1 })
    .select("entryNo")
    .lean();

  const latestNumber = Number(
    String(latestItem?.entryNo || "")
      .replace(prefix, "")
      .replace(/[^0-9]/g, ""),
  );
  const nextNumber = Number.isFinite(latestNumber) ? latestNumber + 1 : 1;

  return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
};

const getValidatedGoodsItem = async (goodsItemId) => {
  return GoodsList.findById(goodsItemId)
    .select("goodsCode goodsDesc goodsUnit")
    .lean();
};

const getValidatedWarehouse = async (warehouseId) => {
  return Warehouse.findById(warehouseId).select("warehouseName").lean();
};

const buildBalanceKey = (goodsItemId, warehouseId) =>
  `${String(goodsItemId)}::${String(warehouseId)}`;

const buildStockBalanceMap = (transactions = []) => {
  const balanceMap = new Map();

  transactions.forEach((item) => {
    const key = buildBalanceKey(item.goodsItemId, item.warehouseId);
    const current = balanceMap.get(key) || {
      goodsItemId: String(item.goodsItemId || ""),
      warehouseId: String(item.warehouseId || ""),
      goodsCode: item.goodsCode || "",
      goodsDesc: item.goodsDesc || "",
      warehouseName: item.warehouseName || "",
      unit: item.unit || "",
      inboundQuantity: 0,
      outboundQuantity: 0,
      currentQuantity: 0,
    };
    const quantity = Number(item.quantity) || 0;

    if (item.transactionType === "outbound") {
      current.outboundQuantity += quantity;
      current.currentQuantity -= quantity;
    } else {
      current.inboundQuantity += quantity;
      current.currentQuantity += quantity;
    }

    balanceMap.set(key, current);
  });

  return balanceMap;
};

const getAllTransactionBalances = async ({ excludeTransactionId = null } = {}) => {
  const filter = excludeTransactionId ? { _id: { $ne: excludeTransactionId } } : {};
  const items = await StockTransaction.find(filter)
    .select(
      "transactionType goodsItemId warehouseId goodsCode goodsDesc warehouseName unit quantity",
    )
    .lean();

  return buildStockBalanceMap(items);
};

const mapBalanceItem = (item) => ({
  goodsItemId: String(item.goodsItemId || ""),
  warehouseId: String(item.warehouseId || ""),
  goodsCode: item.goodsCode || "",
  goodsDesc: item.goodsDesc || "",
  warehouseName: item.warehouseName || "",
  unit: item.unit || "",
  inboundQuantity: Number(item.inboundQuantity || 0),
  outboundQuantity: Number(item.outboundQuantity || 0),
  currentQuantity: Number(item.currentQuantity || 0),
});

const getAvailableOutboundBalance = async ({
  goodsItemId,
  warehouseId,
  excludeTransactionId = null,
} = {}) => {
  const balanceMap = await getAllTransactionBalances({ excludeTransactionId });
  const balance = balanceMap.get(buildBalanceKey(goodsItemId, warehouseId));

  return balance ? Number(balance.currentQuantity || 0) : 0;
};

export const getStockTransactions = async (req, res) => {
  try {
    const transactionType = getTransactionType(req);
    const items = await StockTransaction.find({ transactionType })
      .select(STOCK_TRANSACTION_SELECT_FIELDS)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: items.map(mapTransactionItem),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch stock transactions",
    });
  }
};

export const getAvailableOutboundItems = async (req, res) => {
  try {
    const balanceMap = await getAllTransactionBalances();
    const items = Array.from(balanceMap.values())
      .filter((item) => Number(item.currentQuantity || 0) > 0)
      .map(mapBalanceItem)
      .sort((left, right) =>
        `${left.goodsCode} ${left.warehouseName}`.localeCompare(
          `${right.goodsCode} ${right.warehouseName}`,
        ),
      );

    return res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch available outbound items",
    });
  }
};

export const getInventorySummary = async (req, res) => {
  try {
    const balanceMap = await getAllTransactionBalances();
    const summaryRows = Array.from(balanceMap.values())
      .map(mapBalanceItem)
      .sort((left, right) =>
        `${left.goodsCode} ${left.warehouseName}`.localeCompare(
          `${right.goodsCode} ${right.warehouseName}`,
        ),
      );

    const totals = summaryRows.reduce(
      (acc, item) => {
        acc.inboundQuantity += item.inboundQuantity;
        acc.outboundQuantity += item.outboundQuantity;
        acc.currentQuantity += item.currentQuantity;
        return acc;
      },
      {
        inboundQuantity: 0,
        outboundQuantity: 0,
        currentQuantity: 0,
      },
    );

    return res.status(200).json({
      success: true,
      data: {
        totals,
        items: summaryRows,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch inventory summary",
    });
  }
};

export const createStockTransaction = async (req, res) => {
  try {
    const transactionType = getTransactionType(req);
    const payload = normalizeTransactionPayload(req.body);
    const validationError = getValidationError(payload);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const goodsItem = await getValidatedGoodsItem(payload.goodsItemId);
    const warehouse = await getValidatedWarehouse(payload.warehouseId);

    if (!goodsItem) {
      return res.status(400).json({
        success: false,
        message: "Selected goods item does not exist in Goods List",
      });
    }

    if (!warehouse) {
      return res.status(400).json({
        success: false,
        message: "Selected warehouse does not exist",
      });
    }

    if (transactionType === "outbound") {
      const availableQuantity = await getAvailableOutboundBalance({
        goodsItemId: payload.goodsItemId,
        warehouseId: payload.warehouseId,
      });

      if (availableQuantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Selected item is not available in inbound stock for this warehouse",
        });
      }

      if (payload.quantity > availableQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${availableQuantity} item(s) currently exist in stock for this selection`,
        });
      }
    }

    const item = await StockTransaction.create({
      transactionType,
      entryNo: await getNextEntryNo(transactionType),
      ...buildGoodsSnapshot(goodsItem),
      ...buildWarehouseSnapshot(warehouse),
      quantity: payload.quantity,
      partnerName: payload.partnerName,
      transactionDate: payload.transactionDate,
      status: payload.status,
      notes: payload.notes,
      createdBy: getUserName(req),
      updatedBy: getUserName(req),
    });

    return res.status(201).json({
      success: true,
      message: "Stock transaction created successfully",
      data: mapTransactionItem(item.toObject()),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create stock transaction",
    });
  }
};

export const updateStockTransaction = async (req, res) => {
  try {
    const transactionType = getTransactionType(req);
    const payload = normalizeTransactionPayload(req.body);
    const validationError = getValidationError(payload);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const currentItem = await StockTransaction.findOne({
      _id: req.params.id,
      transactionType,
    });

    if (!currentItem) {
      return res.status(404).json({
        success: false,
        message: "Stock transaction not found",
      });
    }

    const goodsItem = await getValidatedGoodsItem(payload.goodsItemId);
    const warehouse = await getValidatedWarehouse(payload.warehouseId);

    if (!goodsItem) {
      return res.status(400).json({
        success: false,
        message: "Selected goods item does not exist in Goods List",
      });
    }

    if (!warehouse) {
      return res.status(400).json({
        success: false,
        message: "Selected warehouse does not exist",
      });
    }

    if (transactionType === "outbound") {
      const availableQuantity = await getAvailableOutboundBalance({
        goodsItemId: payload.goodsItemId,
        warehouseId: payload.warehouseId,
        excludeTransactionId: req.params.id,
      });

      if (availableQuantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Selected item is not available in inbound stock for this warehouse",
        });
      }

      if (payload.quantity > availableQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${availableQuantity} item(s) currently exist in stock for this selection`,
        });
      }
    }

    Object.assign(currentItem, {
      ...buildGoodsSnapshot(goodsItem),
      ...buildWarehouseSnapshot(warehouse),
      quantity: payload.quantity,
      partnerName: payload.partnerName,
      transactionDate: payload.transactionDate,
      status: payload.status,
      notes: payload.notes,
      updatedBy: getUserName(req),
    });

    await currentItem.save();

    return res.status(200).json({
      success: true,
      message: "Stock transaction updated successfully",
      data: mapTransactionItem(currentItem.toObject()),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update stock transaction",
    });
  }
};

export const deleteStockTransaction = async (req, res) => {
  try {
    const transactionType = getTransactionType(req);
    const item = await StockTransaction.findOneAndDelete({
      _id: req.params.id,
      transactionType,
    }).lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Stock transaction not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stock transaction deleted successfully",
      data: mapTransactionItem(item),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete stock transaction",
    });
  }
};
