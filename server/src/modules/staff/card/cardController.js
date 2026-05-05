import Card from "./cardModel.js";

export const getCards = async (req, res) => {
  try {
    const cards = await Card.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: cards,
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
    const { name, title, path, icon, iconBg, iconColor, subtitle, subtitleTone, createdBy } = req.body;

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
    const { name, title, path, icon, iconBg, iconColor, subtitle, subtitleTone, isActive } = req.body;

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