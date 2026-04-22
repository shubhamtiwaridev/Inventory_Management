const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getUserName = (req) =>
  req.user?.name || req.user?.username || req.user?.email || "System";

const createMasterController = (Model, fieldName, label) => {
  const getItems = async (req, res) => {
    try {
      const items = await Model.find().sort({ createdAt: -1 }).lean();
      res.status(200).json({ data: items });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Failed to fetch ${label.toLowerCase()}s` });
    }
  };

  const getItemById = async (req, res) => {
    try {
      const item = await Model.findById(req.params.id).lean();

      if (!item) {
        return res.status(404).json({ message: `${label} not found` });
      }

      res.status(200).json({ data: item });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Failed to fetch ${label.toLowerCase()}` });
    }
  };

  const createItem = async (req, res) => {
    try {
      const fieldValue = String(req.body[fieldName] || "").trim();

      if (!fieldValue) {
        return res.status(400).json({ message: `${label} is required` });
      }

      const existingItem = await Model.findOne({
        [fieldName]: new RegExp(`^${escapeRegex(fieldValue)}$`, "i"),
      })
        .select("_id")
        .lean();

      if (existingItem) {
        return res.status(400).json({ message: `${label} already exists` });
      }

      const item = await Model.create({
        [fieldName]: fieldValue,
        createdBy: getUserName(req),
      });

      res.status(201).json({
        message: `${label} created successfully`,
        data: item,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Failed to create ${label.toLowerCase()}` });
    }
  };

  const updateItem = async (req, res) => {
    try {
      const fieldValue = String(req.body[fieldName] || "").trim();

      if (!fieldValue) {
        return res.status(400).json({ message: `${label} is required` });
      }

      const existingItem = await Model.findOne({
        _id: { $ne: req.params.id },
        [fieldName]: new RegExp(`^${escapeRegex(fieldValue)}$`, "i"),
      })
        .select("_id")
        .lean();

      if (existingItem) {
        return res.status(400).json({ message: `${label} already exists` });
      }

      const item = await Model.findByIdAndUpdate(
        req.params.id,
        {
          [fieldName]: fieldValue,
          createdBy: getUserName(req),
        },
        { new: true, runValidators: true },
      );

      if (!item) {
        return res.status(404).json({ message: `${label} not found` });
      }

      res.status(200).json({
        message: `${label} updated successfully`,
        data: item,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Failed to update ${label.toLowerCase()}` });
    }
  };

  const deleteItem = async (req, res) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);

      if (!item) {
        return res.status(404).json({ message: `${label} not found` });
      }

      res.status(200).json({ message: `${label} deleted successfully` });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Failed to delete ${label.toLowerCase()}` });
    }
  };

  return {
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
  };
};

export default createMasterController;
