import Complient from "./complientModel.js";

const ALLOWED_SECTIONS = new Set([
  "assets",
  "spare",
  "task-master",
  "vendor-supplier",
]);

const normalizeText = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const normalizeNullableDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeSection = (value) => normalizeText(value).toLowerCase();

const getSectionFieldName = (section) => {
  switch (section) {
    case "assets":
      return "assetName";
    case "spare":
      return "spareName";
    case "task-master":
      return "taskName";
    case "vendor-supplier":
      return "vendorName";
    default:
      return "";
  }
};

const buildPayload = (req) => ({
  section: normalizeSection(req.body.section || req.query.section),
  complaintCode: normalizeText(req.body.complaintCode),
  complaintTitle: normalizeText(req.body.complaintTitle),
  assetName: normalizeText(req.body.assetName),
  spareName: normalizeText(req.body.spareName),
  taskName: normalizeText(req.body.taskName),
  vendorName: normalizeText(req.body.vendorName),
  issueDate: normalizeNullableDate(req.body.issueDate),
  priority: normalizeText(req.body.priority) || "Medium",
  status: normalizeText(req.body.status) || "Open",
  description: normalizeText(req.body.description),
  resolvedBy: normalizeText(req.body.resolvedBy),
  resolvedDate: normalizeNullableDate(req.body.resolvedDate),
  createdBy: normalizeText(req.user?.name),
  updatedBy: normalizeText(req.user?.name),
});

const validatePayload = (payload) => {
  if (!ALLOWED_SECTIONS.has(payload.section)) {
    return "Valid complaint section is required";
  }

  if (!payload.complaintCode || !payload.complaintTitle) {
    return "Complaint code and complaint title are required";
  }

  const sectionFieldName = getSectionFieldName(payload.section);

  if (!sectionFieldName || !payload[sectionFieldName]) {
    return "Please select the related record for this complaint";
  }

  return "";
};

export const getComplients = async (req, res) => {
  try {
    const section = normalizeSection(req.query.section);
    const filter = ALLOWED_SECTIONS.has(section) ? { section } : {};

    const complients = await Complient.find(filter).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: complients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch complaint records",
    });
  }
};

export const getComplientById = async (req, res) => {
  try {
    const complient = await Complient.findById(req.params.id).lean();

    if (!complient) {
      return res.status(404).json({
        success: false,
        message: "Complaint record not found",
      });
    }

    res.status(200).json({
      success: true,
      data: complient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch complaint record",
    });
  }
};

export const createComplient = async (req, res) => {
  try {
    const payload = buildPayload(req);
    const validationError = validatePayload(payload);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const duplicate = await Complient.findOne({
      complaintCode: payload.complaintCode,
    })
      .select("_id")
      .lean();

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Complaint code already exists",
      });
    }

    const complient = await Complient.create(payload);

    res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      data: complient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create complaint",
    });
  }
};

export const updateComplient = async (req, res) => {
  try {
    const existing = await Complient.findById(req.params.id).select("createdBy").lean();

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Complaint record not found",
      });
    }

    const payload = buildPayload(req);
    const validationError = validatePayload(payload);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const duplicate = await Complient.findOne({
      complaintCode: payload.complaintCode,
      _id: { $ne: req.params.id },
    })
      .select("_id")
      .lean();

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Complaint code already exists",
      });
    }

    payload.createdBy = existing.createdBy || "";
    payload.updatedBy = normalizeText(req.user?.name);

    const complient = await Complient.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      data: complient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update complaint",
    });
  }
};

export const deleteComplient = async (req, res) => {
  try {
    const complient = await Complient.findByIdAndDelete(req.params.id);

    if (!complient) {
      return res.status(404).json({
        success: false,
        message: "Complaint record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
      data: complient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete complaint",
    });
  }
};
