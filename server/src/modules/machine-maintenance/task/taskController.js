import Task from "./taskModel.js";

const normalizeText = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const normalizeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildTaskPayload = (req) => ({
  taskCode: normalizeText(req.body.taskCode),
  taskName: normalizeText(req.body.taskName),
  taskCategory: normalizeText(req.body.taskCategory),
  applicableMachine: normalizeText(req.body.applicableMachine),
  frequency: normalizeText(req.body.frequency),
  assignedUser: normalizeText(req.body.assignedUser),
  shift: normalizeText(req.body.shift),
  startDate: normalizeDate(req.body.startDate),
  endDate: normalizeDate(req.body.endDate),
  estimatedDuration: normalizeText(req.body.estimatedDuration),
  requiredManpower: normalizeText(req.body.requiredManpower),
  requiredTools: normalizeText(req.body.requiredTools),
  requiredSpareParts: normalizeText(req.body.requiredSpareParts),
  checklistSteps: normalizeText(req.body.checklistSteps),
  instructions: normalizeText(req.body.instructions),
  safetyPrecautions: normalizeText(req.body.safetyPrecautions),
  skillRequirement: normalizeText(req.body.skillRequirement),
  escalationLevel: normalizeText(req.body.escalationLevel),
  status: normalizeText(req.body.status) || "Active",
  createdBy: normalizeText(req.user?.name),
  updatedBy: normalizeText(req.user?.name),
});

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tasks",
    });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch task",
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const payload = buildTaskPayload(req);

    if (
      !payload.taskCode ||
      !payload.taskName ||
      !payload.taskCategory ||
      !payload.applicableMachine ||
      !payload.frequency ||
      !payload.assignedUser ||
      !payload.startDate ||
      !payload.endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Task code, task name, task category, applicable machine, frequency, assigned user, start date and end date are required",
      });
    }

    const existingTask = await Task.findOne({ taskCode: payload.taskCode });

    if (existingTask) {
      return res.status(400).json({
        success: false,
        message: "Task code already exists",
      });
    }

    const task = await Task.create(payload);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create task",
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const payload = buildTaskPayload(req);

    if (
      !payload.taskCode ||
      !payload.taskName ||
      !payload.taskCategory ||
      !payload.applicableMachine ||
      !payload.frequency ||
      !payload.assignedUser ||
      !payload.startDate ||
      !payload.endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Task code, task name, task category, applicable machine, frequency, assigned user, start date and end date are required",
      });
    }

    const duplicateTask = await Task.findOne({
      taskCode: payload.taskCode,
      _id: { $ne: req.params.id },
    });

    if (duplicateTask) {
      return res.status(400).json({
        success: false,
        message: "Task code already exists",
      });
    }

    payload.createdBy = task.createdBy;
    payload.updatedBy = normalizeText(req.user?.name);

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update task",
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete task",
    });
  }
};
