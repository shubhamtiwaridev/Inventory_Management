import UserAllocation from "./userAllocationModel.js";

const normalizeText = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const buildUserAllocationPayload = (req) => ({
  employeeId: normalizeText(req.body.employeeId),
  userName: normalizeText(req.body.userName),
  role: normalizeText(req.body.role),
  department: normalizeText(req.body.department),
  skillSet: normalizeText(req.body.skillSet),
  shift: normalizeText(req.body.shift),
  mobileNumber: normalizeText(req.body.mobileNumber),
  email: normalizeText(req.body.email).toLowerCase(),
  supervisor: normalizeText(req.body.supervisor),
  machine: normalizeText(req.body.machine),
  task: normalizeText(req.body.task),
  accessRights: normalizeText(req.body.accessRights),
  status: normalizeText(req.body.status) || "Active",
  createdBy: normalizeText(req.user?.name),
  updatedBy: normalizeText(req.user?.name),
});

export const getUserAllocations = async (req, res) => {
  try {
    const userAllocations = await UserAllocation.find()
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: userAllocations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user allocations",
    });
  }
};

export const getUserAllocationById = async (req, res) => {
  try {
    const userAllocation = await UserAllocation.findById(req.params.id).lean();

    if (!userAllocation) {
      return res.status(404).json({
        success: false,
        message: "User allocation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: userAllocation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user allocation",
    });
  }
};

export const createUserAllocation = async (req, res) => {
  try {
    const payload = buildUserAllocationPayload(req);

    if (!payload.employeeId || !payload.userName || !payload.role) {
      return res.status(400).json({
        success: false,
        message: "Employee ID, user name and role are required",
      });
    }

    const existingUserAllocation = await UserAllocation.findOne({
      employeeId: payload.employeeId,
    })
      .select("_id")
      .lean();

    if (existingUserAllocation) {
      return res.status(400).json({
        success: false,
        message: "Employee ID already exists",
      });
    }

    const userAllocation = await UserAllocation.create(payload);

    res.status(201).json({
      success: true,
      message: "User allocation created successfully",
      data: userAllocation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create user allocation",
    });
  }
};

export const updateUserAllocation = async (req, res) => {
  try {
    const userAllocation = await UserAllocation.findById(req.params.id)
      .select("createdBy")
      .lean();

    if (!userAllocation) {
      return res.status(404).json({
        success: false,
        message: "User allocation not found",
      });
    }

    const payload = buildUserAllocationPayload(req);

    if (!payload.employeeId || !payload.userName || !payload.role) {
      return res.status(400).json({
        success: false,
        message: "Employee ID, user name and role are required",
      });
    }

    const duplicateUserAllocation = await UserAllocation.findOne({
      employeeId: payload.employeeId,
      _id: { $ne: req.params.id },
    })
      .select("_id")
      .lean();

    if (duplicateUserAllocation) {
      return res.status(400).json({
        success: false,
        message: "Employee ID already exists",
      });
    }

    payload.createdBy = userAllocation.createdBy;
    payload.updatedBy = normalizeText(req.user?.name);

    const updatedUserAllocation = await UserAllocation.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "User allocation updated successfully",
      data: updatedUserAllocation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update user allocation",
    });
  }
};

export const deleteUserAllocation = async (req, res) => {
  try {
    const userAllocation = await UserAllocation.findByIdAndDelete(
      req.params.id,
    );

    if (!userAllocation) {
      return res.status(404).json({
        success: false,
        message: "User allocation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User allocation deleted successfully",
      data: userAllocation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete user allocation",
    });
  }
};
