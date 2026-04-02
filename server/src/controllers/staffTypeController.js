import StaffType from "../models/StaffTypeModel.js";

export const getStaffTypes = async (req, res) => {
  try {
    const staffTypes = await StaffType.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: staffTypes.length,
      staffTypes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch staff types",
      error: error.message,
    });
  }
};

export const createStaffType = async (req, res) => {
  try {
    const { name, createdBy } = req.body;

    if (!name || !createdBy) {
      return res.status(400).json({
        success: false,
        message: "Staff type and created by are required",
      });
    }

    const exists = await StaffType.findOne({ name: name.trim() });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Staff type already exists",
      });
    }

    const staffType = await StaffType.create({
      name: name.trim(),
      createdBy: createdBy.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Staff type created successfully",
      staffType,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create staff type",
      error: error.message,
    });
  }
};

export const updateStaffType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, createdBy } = req.body;

    const staffType = await StaffType.findById(id);

    if (!staffType) {
      return res.status(404).json({
        success: false,
        message: "Staff type not found",
      });
    }

    if (name) {
      const exists = await StaffType.findOne({
        name: name.trim(),
        _id: { $ne: id },
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Staff type already exists",
        });
      }

      staffType.name = name.trim();
    }

    if (createdBy) {
      staffType.createdBy = createdBy.trim();
    }

    await staffType.save();

    return res.status(200).json({
      success: true,
      message: "Staff type updated successfully",
      staffType,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update staff type",
      error: error.message,
    });
  }
};

export const deleteStaffType = async (req, res) => {
  try {
    const { id } = req.params;

    const staffType = await StaffType.findById(id);

    if (!staffType) {
      return res.status(404).json({
        success: false,
        message: "Staff type not found",
      });
    }

    await StaffType.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Staff type deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete staff type",
      error: error.message,
    });
  }
};