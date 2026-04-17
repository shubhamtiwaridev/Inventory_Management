import Vendor from "./vendorModel.js";

const normalizeText = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const normalizeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildVendorPayload = (req) => ({
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

export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: vendors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch vendors",
    });
  }
};

export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch vendor",
    });
  }
};

export const createVendor = async (req, res) => {
  try {
    const payload = buildVendorPayload(req);

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
          "Vendor code, vendor name, contact person, phone, email and contract type are required",
      });
    }

    const existingVendor = await Vendor.findOne({
      vendorCode: payload.vendorCode,
    });

    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: "Vendor code already exists",
      });
    }

    const vendor = await Vendor.create(payload);

    res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create vendor",
    });
  }
};

export const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const payload = buildVendorPayload(req);

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
          "Vendor code, vendor name, contact person, phone, email and contract type are required",
      });
    }

    const duplicateVendor = await Vendor.findOne({
      vendorCode: payload.vendorCode,
      _id: { $ne: req.params.id },
    });

    if (duplicateVendor) {
      return res.status(400).json({
        success: false,
        message: "Vendor code already exists",
      });
    }

    payload.createdBy = vendor.createdBy;
    payload.updatedBy = normalizeText(req.user?.name);

    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      data: updatedVendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update vendor",
    });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete vendor",
    });
  }
};
