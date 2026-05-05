import Card from "./cardModel.js";

const RESTRICTED_STAFF_TYPE_CARD_NAMES = new Set(["staff"]);

const shouldAllowInStaffTypesByDefault = ({ name = "", path = "" } = {}) => {
  const normalizedName = String(name || "")
    .trim()
    .toLowerCase();
  const normalizedPath = String(path || "")
    .trim()
    .toLowerCase();

  if (RESTRICTED_STAFF_TYPE_CARD_NAMES.has(normalizedName)) {
    return false;
  }

  if (normalizedPath === "/staff" || normalizedPath.startsWith("/staff/")) {
    return false;
  }

  return true;
};

export const getCards = async (req, res) => {
  try {
    const cards = await Card.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    const normalizedCards = cards.map((card) => ({
      ...card,
      allowInStaffTypes:
        typeof card.allowInStaffTypes === "boolean"
          ? card.allowInStaffTypes
          : shouldAllowInStaffTypesByDefault(card),
    }));

    res.status(200).json({
      success: true,
      data: normalizedCards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createCard = async (req, res) => {
  try {
    const {
      name,
      title,
      path,
      icon,
      iconBg,
      iconColor,
      subtitle,
      subtitleTone,
      createdBy,
      allowInStaffTypes,
    } = req.body;

    if (!name || !title || !path || !icon || !iconBg || !iconColor || !createdBy) {
      return res.status(400).json({
        success: false,
        message: "All card fields are required",
      });
    }

    const card = await Card.create({
      name: name.trim(),
      title: title.trim(),
      path: path.trim(),
      icon: icon.trim(),
      iconBg: iconBg.trim(),
      iconColor: iconColor.trim(),
      subtitle: subtitle?.trim() || "",
      subtitleTone: subtitleTone || "success",
      allowInStaffTypes:
        typeof allowInStaffTypes === "boolean"
          ? allowInStaffTypes
          : shouldAllowInStaffTypesByDefault({
              name: name.trim(),
              path: path.trim(),
            }),
      createdBy: createdBy.trim(),
    });

    res.status(201).json({
      success: true,
      data: card,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Card name already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      title,
      path,
      icon,
      iconBg,
      iconColor,
      subtitle,
      subtitleTone,
      isActive,
      allowInStaffTypes,
    } = req.body;

    if (!name || !title || !path || !icon || !iconBg || !iconColor) {
      return res.status(400).json({
        success: false,
        message: "All card fields are required",
      });
    }

    const card = await Card.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        title: title.trim(),
        path: path.trim(),
        icon: icon.trim(),
        iconBg: iconBg.trim(),
        iconColor: iconColor.trim(),
        subtitle: subtitle?.trim() || "",
        subtitleTone: subtitleTone || "success",
        isActive: isActive !== undefined ? isActive : true,
        allowInStaffTypes:
          typeof allowInStaffTypes === "boolean"
            ? allowInStaffTypes
            : shouldAllowInStaffTypesByDefault({
                name: name.trim(),
                path: path.trim(),
              }),
      },
      { new: true, runValidators: true }
    );

    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    res.status(200).json({
      success: true,
      data: card,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Card name already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await Card.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Card deactivated successfully",
      data: card,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const activateCard = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await Card.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Card activated successfully",
      data: card,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
