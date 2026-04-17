import Asset from "./assetModel.js";

const normalizeText = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const normalizeNullableDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildAssetPayload = (req) => ({
  assetCode: normalizeText(req.body.assetCode),
  assetName: normalizeText(req.body.assetName),
  category: normalizeText(req.body.category),
  plant: normalizeText(req.body.plant),
  department: normalizeText(req.body.department),
  manufacturer: normalizeText(req.body.manufacturer),
  modelNumber: normalizeText(req.body.modelNumber),
  serialNumber: normalizeText(req.body.serialNumber),
  commissioningDate: normalizeNullableDate(req.body.commissioningDate),
  purchaseDate: normalizeNullableDate(req.body.purchaseDate),
  warrantyStart: normalizeNullableDate(req.body.warrantyStart),
  warrantyEnd: normalizeNullableDate(req.body.warrantyEnd),
  criticality: normalizeText(req.body.criticality),
  status: normalizeText(req.body.status) || "Running",
  powerRating: normalizeText(req.body.powerRating),
  technicalSpecifications: normalizeText(req.body.technicalSpecifications),
  operatingManual:
    req.files?.operatingManual?.[0]?.path ||
    normalizeText(req.body.operatingManual),
  machineImage:
    req.files?.machineImage?.[0]?.path || normalizeText(req.body.machineImage),
  qrCode: normalizeText(req.body.qrCode),
  createdBy: normalizeText(req.user?.name),
  updatedBy: normalizeText(req.user?.name),
});

export const getAssets = async (req, res) => {
  try {
    const assets = await Asset.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: assets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch assets",
    });
  }
};

export const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch asset",
    });
  }
};

export const createAsset = async (req, res) => {
  try {
    const payload = buildAssetPayload(req);

    if (
      !payload.assetCode ||
      !payload.assetName ||
      !payload.category ||
      !payload.plant ||
      !payload.department ||
      !payload.manufacturer ||
      !payload.serialNumber
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Asset code, asset name, category, plant, department, manufacturer and serial number are required",
      });
    }

    const existingAsset = await Asset.findOne({ assetCode: payload.assetCode });

    if (existingAsset) {
      return res.status(400).json({
        success: false,
        message: "Asset code already exists",
      });
    }

    const asset = await Asset.create(payload);

    res.status(201).json({
      success: true,
      message: "Asset created successfully",
      data: asset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create asset",
    });
  }
};

export const updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    const payload = buildAssetPayload(req);

    if (
      !payload.assetCode ||
      !payload.assetName ||
      !payload.category ||
      !payload.plant ||
      !payload.department ||
      !payload.manufacturer ||
      !payload.serialNumber
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Asset code, asset name, category, plant, department, manufacturer and serial number are required",
      });
    }

    const duplicateAsset = await Asset.findOne({
      assetCode: payload.assetCode,
      _id: { $ne: req.params.id },
    });

    if (duplicateAsset) {
      return res.status(400).json({
        success: false,
        message: "Asset code already exists",
      });
    }

    payload.createdBy = asset.createdBy;
    payload.updatedBy = normalizeText(req.user?.name);
    payload.operatingManual = payload.operatingManual || asset.operatingManual;
    payload.machineImage = payload.machineImage || asset.machineImage;

    const updatedAsset = await Asset.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Asset updated successfully",
      data: updatedAsset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update asset",
    });
  }
};

export const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Asset deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete asset",
    });
  }
};
