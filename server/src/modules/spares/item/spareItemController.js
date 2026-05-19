import SpareItem from "./spareItemModel.js";

const normalizeText = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const normalizeNumber = (value) => {
  if (value === undefined || value === null || value === "") return 0;
  const number = Number(value);
  return Number.isNaN(number) ? 0 : number;
};

const buildSpareItemPayload = (req) => ({
  spareCode: normalizeText(req.body.spareCode),
  spareName: normalizeText(req.body.spareName),
  description: normalizeText(req.body.description),
  linkedMachine: normalizeText(req.body.linkedMachine),
  partCategory: normalizeText(req.body.partCategory),
  vendor: normalizeText(req.body.vendor),
  partNo: normalizeText(req.body.partNo),
  unit: normalizeText(req.body.unit),
  reorderLevel: normalizeNumber(req.body.reorderLevel),
  minQty: normalizeNumber(req.body.minQty),
  maxQty: normalizeNumber(req.body.maxQty),
  currentStock: normalizeNumber(req.body.currentStock),
  leadTime: normalizeNumber(req.body.leadTime),
  costPerUnit: normalizeNumber(req.body.costPerUnit),
  alternatePart: normalizeText(req.body.alternatePart),
  shelfLocation: normalizeText(req.body.shelfLocation),
  batchNo: normalizeText(req.body.batchNo),
  status: normalizeText(req.body.status) || "Active",
  createdBy: normalizeText(req.user?.name),
  updatedBy: normalizeText(req.user?.name),
});

export const getSpareItems = async (req, res) => {
  try {
    const items = await SpareItem.find().sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch spare items",
    });
  }
};

export const getSpareItemById = async (req, res) => {
  try {
    const item = await SpareItem.findById(req.params.id).lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Spare item not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch spare item",
    });
  }
};

export const createSpareItem = async (req, res) => {
  try {
    const payload = buildSpareItemPayload(req);

    if (
      !payload.spareCode ||
      !payload.spareName ||
      !payload.vendor ||
      !payload.partNo ||
      !payload.unit
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Spare code, spare name, supplier, part number and unit are required",
      });
    }

    const existingItem = await SpareItem.findOne({
      spareCode: payload.spareCode,
    })
      .select("_id")
      .lean();

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Spare code already exists",
      });
    }

    const item = await SpareItem.create(payload);

    return res.status(201).json({
      success: true,
      message: "Spare item created successfully",
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create spare item",
    });
  }
};

export const updateSpareItem = async (req, res) => {
  try {
    const item = await SpareItem.findById(req.params.id).select("createdBy").lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Spare item not found",
      });
    }

    const payload = buildSpareItemPayload(req);

    if (
      !payload.spareCode ||
      !payload.spareName ||
      !payload.vendor ||
      !payload.partNo ||
      !payload.unit
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Spare code, spare name, supplier, part number and unit are required",
      });
    }

    const duplicateItem = await SpareItem.findOne({
      spareCode: payload.spareCode,
      _id: { $ne: req.params.id },
    })
      .select("_id")
      .lean();

    if (duplicateItem) {
      return res.status(400).json({
        success: false,
        message: "Spare code already exists",
      });
    }

    payload.createdBy = item.createdBy;
    payload.updatedBy = normalizeText(req.user?.name);

    const updatedItem = await SpareItem.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Spare item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update spare item",
    });
  }
};

export const deleteSpareItem = async (req, res) => {
  try {
    const item = await SpareItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Spare item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Spare item deleted successfully",
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete spare item",
    });
  }
};
