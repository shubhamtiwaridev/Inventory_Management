import StaffType from "./staffTypeModel.js";
import Card from "../card/cardModel.js";

const isSuperadminName = (name = "") =>
  String(name).trim().toLowerCase() === "superadmin";

const getUserName = (req) =>
  req.user?.name || req.user?.username || req.user?.email || "System";

const cardSelectFields =
  "name title path icon iconBg iconColor subtitle subtitleTone";

export const getStaffTypes = async (req, res) => {
  try {
    const staffTypes = await StaffType.find()
      .populate("assignedCards", cardSelectFields)
      .sort({ createdAt: -1 })
      .lean();

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
    const { name, assignedCards } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Staff Type name is required",
      });
    }

    const normalizedName = name.trim();
    const selectedCards = isSuperadminName(normalizedName) ? [] : assignedCards;

    if (!isSuperadminName(normalizedName)) {
      if (!Array.isArray(selectedCards) || selectedCards.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one card must be assigned to the staff type",
        });
      }

      const existingCards = await Card.find({
        _id: { $in: selectedCards },
        isActive: true,
      });

      if (existingCards.length !== selectedCards.length) {
        return res.status(400).json({
          success: false,
          message: "One or more assigned cards do not exist or are inactive",
        });
      }
    }

    const staffType = await StaffType.create({
      name: normalizedName,
      assignedCards: selectedCards,
      createdBy: getUserName(req),
    });
    // Populate the assigned cards in the response
    await staffType.populate("assignedCards", cardSelectFields);

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
    const { name, assignedCards } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Staff Type name is required",
      });
    }

    const normalizedName = name.trim();
    const selectedCards = isSuperadminName(normalizedName) ? [] : assignedCards;

    if (!isSuperadminName(normalizedName)) {
      if (!Array.isArray(selectedCards) || selectedCards.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one card must be assigned to the staff type",
        });
      }

      const existingCards = await Card.find({
        _id: { $in: selectedCards },
        isActive: true,
      });

      if (existingCards.length !== selectedCards.length) {
        return res.status(400).json({
          success: false,
          message: "One or more assigned cards do not exist or are inactive",
        });
      }
    }

    const staffType = await StaffType.findByIdAndUpdate(
      id,
      {
        name: normalizedName,
        assignedCards: selectedCards,
        createdBy: getUserName(req),
      },
      { returnDocument: "after", runValidators: true },
    ).populate("assignedCards", cardSelectFields);

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
      data: staffType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
