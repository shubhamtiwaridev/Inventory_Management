import LogActivity from "./logActivityModel.js";
import { createManualLogActivity } from "./logActivityService.js";

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
        { page: regex },
        { resource: regex },
        { targetName: regex },
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

export const createLogActivity = async (req, res) => {
  try {
    const action = String(req.body?.action || "").trim() || "Opened";
    const module = String(req.body?.module || "").trim();
    const page = String(req.body?.page || "").trim();
    const resource = String(req.body?.resource || "").trim() || "Card";
    const targetName = String(req.body?.targetName || "").trim();
    const endpoint = String(req.body?.endpoint || "").trim();
    const details =
      req.body?.details && typeof req.body.details === "object"
        ? req.body.details
        : {};

    if (!page) {
      return res.status(400).json({
        success: false,
        message: "Page is required",
      });
    }

    const log = await createManualLogActivity({
      userId: req.user?._id || null,
      userName: req.user?.name || req.user?.username || req.user?.email || "Guest",
      userEmail: req.user?.email || "",
      role: req.user?.roles || req.user?.role || "",
      action,
      module,
      page,
      resource,
      targetName,
      endpoint,
      method: "OPEN",
      statusCode: 200,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
      userAgent: req.get("user-agent") || "",
      details,
    });

    res.status(201).json({
      success: true,
      message: "Activity log created successfully",
      data: log,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create activity log",
    });
  }
};
