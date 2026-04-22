import Spare from "./spareModel.js";

const normalizeText = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const normalizeNumber = (value) => {
  if (value === undefined || value === null || value === "") return 0;
  const number = Number(value);
  return Number.isNaN(number) ? 0 : number;
};

const buildSparePayload = (req) => ({
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

export const getSpares = async (req, res) => {
  try {
    const spares = await Spare.find().sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: spares,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch spares",
    });
  }
};

export const getSpareById = async (req, res) => {
  try {
    const spare = await Spare.findById(req.params.id).lean();

    if (!spare) {
      return res.status(404).json({
        success: false,
        message: "Spare not found",
      });
    }

    res.status(200).json({
      success: true,
      data: spare,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch spare",
    });
  }
};

export const createSpare = async (req, res) => {
  try {
    const payload = buildSparePayload(req);

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
          "Spare code, spare name, vendor, part number and unit are required",
      });
    }

    const existingSpare = await Spare.findOne({ spareCode: payload.spareCode })
      .select("_id")
      .lean();

    if (existingSpare) {
      return res.status(400).json({
        success: false,
        message: "Spare code already exists",
      });
    }

    const spare = await Spare.create(payload);

    res.status(201).json({
      success: true,
      message: "Spare created successfully",
      data: spare,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create spare",
    });
  }
};

export const updateSpare = async (req, res) => {
  try {
    const spare = await Spare.findById(req.params.id).select("createdBy").lean();

    if (!spare) {
      return res.status(404).json({
        success: false,
        message: "Spare not found",
      });
    }

    const payload = buildSparePayload(req);

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
          "Spare code, spare name, vendor, part number and unit are required",
      });
    }

    const duplicateSpare = await Spare.findOne({
      spareCode: payload.spareCode,
      _id: { $ne: req.params.id },
    })
      .select("_id")
      .lean();

    if (duplicateSpare) {
      return res.status(400).json({
        success: false,
        message: "Spare code already exists",
      });
    }

    payload.createdBy = spare.createdBy;
    payload.updatedBy = normalizeText(req.user?.name);

    const updatedSpare = await Spare.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Spare updated successfully",
      data: updatedSpare,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update spare",
    });
  }
};

export const deleteSpare = async (req, res) => {
  try {
    const spare = await Spare.findByIdAndDelete(req.params.id);

    if (!spare) {
      return res.status(404).json({
        success: false,
        message: "Spare not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Spare deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete spare",
    });
  }
};
