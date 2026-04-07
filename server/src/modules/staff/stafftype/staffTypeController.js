import StaffType from "./staffTypeModel.js";

export const getStaffTypes = async (req, res) => {
  try {
    const staffTypes = await StaffType.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: staffTypes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createStaffType = async (req, res) => {
  try {
    const { name, createdBy } = req.body;

    if (!name || !createdBy) {
      return res.status(400).json({
        success: false,
        message: "Staff Type and Creater Person are required",
      });
    }

    const staffType = await StaffType.create({
      name: name.trim(),
      createdBy: createdBy.trim(),
    });

    res.status(201).json({
      success: true,
      data: staffType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateStaffType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, createdBy } = req.body;

    if (!name || !createdBy) {
      return res.status(400).json({
        success: false,
        message: "Staff Type and Creater Person are required",
      });
    }

    const staffType = await StaffType.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        createdBy: createdBy.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!staffType) {
      return res.status(404).json({
        success: false,
        message: "Staff type not found",
      });
    }

    res.status(200).json({
      success: true,
      data: staffType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteStaffType = async (req, res) => {
  try {
    const { id } = req.params;

    const staffType = await StaffType.findByIdAndDelete(id);

    if (!staffType) {
      return res.status(404).json({
        success: false,
        message: "Staff type not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Staff type deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};