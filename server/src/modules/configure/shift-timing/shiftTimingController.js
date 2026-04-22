import ShiftTiming from "./shiftTimingModel.js";

const getUserName = (req) =>
  req.user?.name || req.user?.username || req.user?.email || "System";

const normalizeText = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const resolveShiftTimingPayload = (body = {}) => {
  const fromTime = normalizeText(body.fromTime || body.shiftFrom || body.from);
  const toTime = normalizeText(body.toTime || body.shiftTo || body.to);
  const explicitShiftTiming = normalizeText(
    body.shiftTiming || body.shift || body.name || body.label,
  );

  const shiftTiming =
    explicitShiftTiming || [fromTime, toTime].filter(Boolean).join(" - ");

  return {
    fromTime,
    toTime,
    shiftTiming,
    shiftFrom: fromTime,
    shiftTo: toTime,
  };
};

export const getShiftTimings = async (req, res) => {
  try {
    const items = await ShiftTiming.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ data: items });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shift timing records" });
  }
};

export const getShiftTimingById = async (req, res) => {
  try {
    const item = await ShiftTiming.findById(req.params.id).lean();

    if (!item) {
      return res.status(404).json({ message: "Shift Timing not found" });
    }

    res.status(200).json({ data: item });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shift timing details" });
  }
};

export const createShiftTiming = async (req, res) => {
  try {
    const payload = resolveShiftTimingPayload(req.body);

    if (!payload.shiftTiming) {
      return res.status(400).json({ message: "Shift Timing is required" });
    }

    const existingItem = await ShiftTiming.findOne({
      shiftTiming: new RegExp(`^${escapeRegex(payload.shiftTiming)}$`, "i"),
    })
      .select("_id")
      .lean();

    if (existingItem) {
      return res.status(400).json({ message: "Shift Timing already exists" });
    }

    const item = await ShiftTiming.create({
      ...payload,
      createdBy: getUserName(req),
    });

    res.status(201).json({
      message: "Shift Timing created successfully",
      data: item,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create shift timing" });
  }
};

export const updateShiftTiming = async (req, res) => {
  try {
    const existingRecord = await ShiftTiming.findById(req.params.id)
      .select("createdBy")
      .lean();

    if (!existingRecord) {
      return res.status(404).json({ message: "Shift Timing not found" });
    }

    const payload = resolveShiftTimingPayload(req.body);

    if (!payload.shiftTiming) {
      return res.status(400).json({ message: "Shift Timing is required" });
    }

    const duplicateItem = await ShiftTiming.findOne({
      _id: { $ne: req.params.id },
      shiftTiming: new RegExp(`^${escapeRegex(payload.shiftTiming)}$`, "i"),
    })
      .select("_id")
      .lean();

    if (duplicateItem) {
      return res.status(400).json({ message: "Shift Timing already exists" });
    }

    const item = await ShiftTiming.findByIdAndUpdate(
      req.params.id,
      {
        ...payload,
        createdBy: existingRecord.createdBy || getUserName(req),
      },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      message: "Shift Timing updated successfully",
      data: item,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update shift timing" });
  }
};

export const deleteShiftTiming = async (req, res) => {
  try {
    const item = await ShiftTiming.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Shift Timing not found" });
    }

    res.status(200).json({ message: "Shift Timing deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete shift timing" });
  }
};
