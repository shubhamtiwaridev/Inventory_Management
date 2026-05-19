import SpareSupplier from "./spareSupplierModel.js";

const normalizeText = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const normalizeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildSupplierPayload = (req) => ({
  vendorCode: normalizeText(req.body.vendorCode),
  vendorName: normalizeText(req.body.vendorName),
  contactPerson: normalizeText(req.body.contactPerson),
  phone: normalizeText(req.body.phone),
  email: normalizeText(req.body.email).toLowerCase(),
  city: normalizeText(req.body.city),
  contractType: normalizeText(req.body.contractType),
  sla: normalizeText(req.body.sla),
  machinesCovered: normalizeText(req.body.machinesCovered),
  contractValidityFrom: normalizeDate(req.body.contractValidityFrom),
  contractValidityTo: normalizeDate(req.body.contractValidityTo),
  escalationContacts: normalizeText(req.body.escalationContacts),
  status: normalizeText(req.body.status) || "Active",
  createdBy: normalizeText(req.user?.name),
  updatedBy: normalizeText(req.user?.name),
});

export const getSpareSuppliers = async (req, res) => {
  try {
    const suppliers = await SpareSupplier.find().sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      data: suppliers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch suppliers",
    });
  }
};

export const getSpareSupplierById = async (req, res) => {
  try {
    const supplier = await SpareSupplier.findById(req.params.id).lean();

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch supplier",
    });
  }
};

export const createSpareSupplier = async (req, res) => {
  try {
    const payload = buildSupplierPayload(req);

    if (
      !payload.vendorCode ||
      !payload.vendorName ||
      !payload.contactPerson ||
      !payload.phone ||
      !payload.email ||
      !payload.contractType
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Supplier code, supplier name, contact person, phone, email and contract type are required",
      });
    }

    const existingSupplier = await SpareSupplier.findOne({
      vendorCode: payload.vendorCode,
    })
      .select("_id")
      .lean();

    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: "Supplier code already exists",
      });
    }

    const supplier = await SpareSupplier.create(payload);

    return res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      data: supplier,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create supplier",
    });
  }
};

export const updateSpareSupplier = async (req, res) => {
  try {
    const supplier = await SpareSupplier.findById(req.params.id)
      .select("createdBy")
      .lean();

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    const payload = buildSupplierPayload(req);

    if (
      !payload.vendorCode ||
      !payload.vendorName ||
      !payload.contactPerson ||
      !payload.phone ||
      !payload.email ||
      !payload.contractType
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Supplier code, supplier name, contact person, phone, email and contract type are required",
      });
    }

    const duplicateSupplier = await SpareSupplier.findOne({
      vendorCode: payload.vendorCode,
      _id: { $ne: req.params.id },
    })
      .select("_id")
      .lean();

    if (duplicateSupplier) {
      return res.status(400).json({
        success: false,
        message: "Supplier code already exists",
      });
    }

    payload.createdBy = supplier.createdBy;
    payload.updatedBy = normalizeText(req.user?.name);

    const updatedSupplier = await SpareSupplier.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      data: updatedSupplier,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update supplier",
    });
  }
};

export const deleteSpareSupplier = async (req, res) => {
  try {
    const supplier = await SpareSupplier.findByIdAndDelete(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
      data: supplier,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete supplier",
    });
  }
};
