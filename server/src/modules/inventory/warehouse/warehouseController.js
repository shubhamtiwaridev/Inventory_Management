import Warehouse from "./warehouseModel.js";
import StockTransaction from "../stock-transaction/stockTransactionModel.js";

const WAREHOUSE_SELECT_FIELDS =
  "warehouseCode warehouseName location description createdBy createdAt updatedAt";

const pad = (value) => String(value).padStart(2, "0");
const normalizeValue = (value) => String(value || "").trim();

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

const normalizeWarehousePayload = (payload = {}) => ({
  warehouseCode: normalizeValue(payload.warehouseCode),
  warehouseName: normalizeValue(payload.warehouseName),
  location: normalizeValue(payload.location),
  description: normalizeValue(payload.description),
});

const mapWarehouseItem = (item) => ({
  id: String(item._id),
  warehouseCode: item.warehouseCode || "",
  warehouseName: item.warehouseName || "",
  location: item.location || "",
  description: item.description || "",
  createdBy: item.createdBy || "System",
  createdAt: formatDateTime(item.createdAt),
  updatedAt: formatDateTime(item.updatedAt),
});

const getValidationError = (payload = {}) => {
  if (!payload.warehouseName) {
    return "Warehouse name is required";
  }

  return "";
};

const escapeRegex = (value = "") =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildDuplicateQuery = (payload = {}, excludedId = null) => {
  const conditions = [
    payload.warehouseCode && {
      warehouseCode: {
        $regex: `^${escapeRegex(payload.warehouseCode)}$`,
        $options: "i",
      },
    },
    payload.warehouseName && {
      warehouseName: {
        $regex: `^${escapeRegex(payload.warehouseName)}$`,
        $options: "i",
      },
    },
  ].filter(Boolean);

  if (conditions.length === 0) {
    return null;
  }

  return {
    ...(excludedId ? { _id: { $ne: excludedId } } : {}),
    $or: conditions,
  };
};

const findDuplicateWarehouse = async (payload = {}, excludedId = null) => {
  const duplicateQuery = buildDuplicateQuery(payload, excludedId);

  if (!duplicateQuery) {
    return null;
  }

  return Warehouse.findOne(duplicateQuery)
    .select("warehouseCode warehouseName")
    .lean();
};

export const getWarehouses = async (req, res) => {
  try {
    const items = await Warehouse.find({})
      .select(WAREHOUSE_SELECT_FIELDS)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: items.map(mapWarehouseItem),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch warehouses",
    });
  }
};

export const createWarehouse = async (req, res) => {
  try {
    const payload = normalizeWarehousePayload(req.body);
    const validationError = getValidationError(payload);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const duplicateItem = await findDuplicateWarehouse(payload);

    if (duplicateItem) {
      return res.status(409).json({
        success: false,
        message: "Duplicate warehouse already exists",
      });
    }

    const item = await Warehouse.create({
      ...payload,
      createdBy: getUserName(req),
      updatedBy: getUserName(req),
    });

    return res.status(201).json({
      success: true,
      message: "Warehouse created successfully",
      data: mapWarehouseItem(item.toObject()),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create warehouse",
    });
  }
};

export const updateWarehouse = async (req, res) => {
  try {
    const payload = normalizeWarehousePayload(req.body);
    const validationError = getValidationError(payload);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const duplicateItem = await findDuplicateWarehouse(payload, req.params.id);

    if (duplicateItem) {
      return res.status(409).json({
        success: false,
        message: "Duplicate warehouse already exists",
      });
    }

    const item = await Warehouse.findByIdAndUpdate(
      req.params.id,
      {
        ...payload,
        updatedBy: getUserName(req),
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Warehouse updated successfully",
      data: mapWarehouseItem(item),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update warehouse",
    });
  }
};

export const deleteWarehouse = async (req, res) => {
  try {
    const existingTransaction = await StockTransaction.findOne({
      warehouseId: req.params.id,
    })
      .select("_id")
      .lean();

    if (existingTransaction) {
      return res.status(409).json({
        success: false,
        message:
          "Warehouse is used in inbound or outbound records and cannot be deleted",
      });
    }

    const item = await Warehouse.findByIdAndDelete(req.params.id).lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Warehouse deleted successfully",
      data: mapWarehouseItem(item),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete warehouse",
    });
  }
};
