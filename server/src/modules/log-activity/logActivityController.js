import LogActivity from "./logActivityModel.js";

const escapeRegex = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePositiveInteger = (value, fallback) => {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number > 0 ? number : fallback;
};

export const getLogActivities = async (req, res) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = Math.min(parsePositiveInteger(req.query.limit, 100), 500);
    const skip = (page - 1) * limit;
    const search = String(req.query.search || "").trim();
    const filter = {};

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");

      filter.$or = [
        { userName: regex },
        { userEmail: regex },
        { role: regex },
        { action: regex },
        { module: regex },
        { resource: regex },
        { endpoint: regex },
      ];
    }

    const [logs, total] = await Promise.all([
      LogActivity.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LogActivity.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch activity logs",
    });
  }
};

export const deleteLogActivity = async (req, res) => {
  try {
    const log = await LogActivity.findByIdAndDelete(req.params.id).lean();

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Activity log not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Activity log deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete activity log",
    });
  }
};

export const clearLogActivities = async (req, res) => {
  try {
    await LogActivity.deleteMany({});

    res.status(200).json({
      success: true,
      message: "Activity logs cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to clear activity logs",
    });
  }
};
