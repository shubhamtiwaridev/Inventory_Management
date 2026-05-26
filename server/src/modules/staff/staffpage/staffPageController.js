import User from "../../auth/authModel.js";
import StaffType from "../stafftype/staffTypeModel.js";

const buildUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  roles: user.roles,
  staffType: user.staffType,
  assignedCards: user.staffType?.assignedCards || [],
  permissions: user.permissions || {},
  isVerified: user.isVerified,
  verifiedBy: user.verifiedBy,
  verifiedAt: user.verifiedAt,
  createdFrom: user.createdFrom,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  passwordChangeRequest: user.passwordChangeRequest,
  passwordChangeRequestAt: user.passwordChangeRequestAt,
  passwordChangeRequestMessage: user.passwordChangeRequestMessage,
});

const isSuperadminRole = (roles = "") =>
  String(roles).trim().toLowerCase() === "superadmin";

const staffTypePopulateOptions = {
  path: "staffType",
  populate: {
    path: "assignedCards",
    select: "name title path icon iconBg iconColor subtitle subtitleTone",
  },
};

const ACTIONS = ["create", "update", "delete"];

const MODULE_PERMISSION_PATHS = {
  inventory: [
    "/inventory/inbound",
    "/inventory/outbound",
    "/inventory",
    "/inventory/goodslist/list",
    "/inventory/warehouses",
    "/inventory/upload-center",
    "/inventory/download-center",
  ],
  machine_maintenance: [
    "/machine-maintenance/assets/list",
    "/machine-maintenance/assets/register",
    "/machine-maintenance/spare-master/list",
    "/machine-maintenance/spare-master/register",
    "/machine-maintenance/tasks/list",
    "/machine-maintenance/tasks/schedule",
    "/machine-maintenance/user-allocation/list",
    "/machine-maintenance/user-allocation/allocation",
    "/machine-maintenance/vendors/list",
    "/machine-maintenance/vendors/register",
    "/machine-maintenance/consume/breakdown-list",
    "/machine-maintenance/consume/entry",
    "/machine-maintenance/complient/assets",
    "/machine-maintenance/complient/spare",
    "/machine-maintenance/complient/task-master",
    "/machine-maintenance/complient/vendor-supplier",
    "/machine-maintenance/configure/department",
    "/machine-maintenance/configure/shift-timing",
    "/machine-maintenance/configure/plant-site",
    "/machine-maintenance/configure/status",
    "/machine-maintenance/configure/critical-level",
    "/machine-maintenance/configure/unit-of-measure",
    "/machine-maintenance/configure/task-category",
    "/machine-maintenance/configure/frequency",
    "/machine-maintenance/configure/contract-type",
  ],
  spares: [
    "/spares",
    "/spares/items",
    "/spares/storage",
    "/spares/issue",
    "/spares/re-orders",
    "/spares/suppliers",
  ],
  ecom: [
    "/ecom",
    "/ecom/amazon",
    "/ecom/flipkart",
    "/ecom/messho",
    "/ecom/upload-center",
    "/ecom/download-center",
  ],
  log_activity: ["/log-activity"],
};

const normalizeKey = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "_");

const normalizePath = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\/+$/, "");

const getSidebarRootKey = (path = "") => {
  const parts = String(path || "")
    .split("/")
    .filter(Boolean);

  return normalizeKey(parts[0] || "");
};

const getAssignedCardNames = (assignedCards = []) =>
  assignedCards
    .map((card) => normalizeKey(card?.name || card?.title || card?.path || card))
    .filter(Boolean);

const buildDefaultActions = (enabled = true) =>
  ACTIONS.reduce((acc, action) => {
    acc[action] = enabled;
    return acc;
  }, {});

const hasEnabledPermissions = (permissions = {}) =>
  Object.values(permissions || {}).some((permission) => permission?.enabled);

const sanitizePermissionsForAssignedCards = (assignedCards = [], permissions = {}) => {
  const assignedCardNames = new Set(getAssignedCardNames(assignedCards));
  const allowedPathMap = {};

  assignedCardNames.forEach((cardName) => {
    allowedPathMap[cardName] = new Set(
      (MODULE_PERMISSION_PATHS[cardName] || []).map((path) =>
        normalizePath(path),
      ),
    );
  });

  return Object.entries(permissions || {}).reduce((acc, [permissionKey, value]) => {
    if (!value || typeof value !== "object") {
      return acc;
    }

    const cardName = normalizeKey(value.card || getSidebarRootKey(value.path));
    const path = normalizePath(value.path);
    const allowedPaths = allowedPathMap[cardName];

    if (!cardName || !assignedCardNames.has(cardName) || !allowedPaths?.has(path)) {
      return acc;
    }

    acc[permissionKey] = {
      card: cardName,
      feature: String(value.feature || "").trim(),
      path,
      enabled: Boolean(value.enabled),
      actions: ACTIONS.reduce((actions, action) => {
        actions[action] = Boolean(value.actions?.[action]);
        return actions;
      }, buildDefaultActions(false)),
    };

    return acc;
  }, {});
};

const ensureSuperadminRequest = (req, res) => {
  if (isSuperadminRole(req.user?.roles)) {
    return true;
  }

  res.status(403).json({
    success: false,
    message: "Only superadmin can manage user permissions",
  });

  return false;
};

const validateStaffTypeForRole = async (roles, staffType) => {
  if (isSuperadminRole(roles)) {
    return null;
  }

  if (!staffType) {
    throw new Error("Staff type is required");
  }

  const existingStaffType = await StaffType.findById(staffType)
    .select("_id assignedCards")
    .lean();

  if (!existingStaffType) {
    throw new Error("Selected staff type does not exist");
  }

  if (
    !Array.isArray(existingStaffType.assignedCards) ||
    existingStaffType.assignedCards.length === 0
  ) {
    throw new Error("Selected staff type has no assigned cards");
  }

  return staffType;
};

export const getStaffUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate(staffTypePopulateOptions)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch staff users",
    });
  }
};

export const createStaffUser = async (req, res) => {
  try {
    const { name, email, roles, staffType, password, permissions } = req.body;

    if (!name || !email || !roles || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, roles and password are required",
      });
    }

    let finalStaffType = null;

    try {
      finalStaffType = await validateStaffTypeForRole(roles, staffType);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message,
      });
    }
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail })
      .select("_id")
      .lean();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    let sanitizedPermissions = {};

    if (!isSuperadminRole(roles)) {
      const selectedStaffType = await StaffType.findById(finalStaffType)
        .populate(staffTypePopulateOptions.populate)
        .select("assignedCards")
        .lean();

      sanitizedPermissions = sanitizePermissionsForAssignedCards(
        selectedStaffType?.assignedCards || [],
        permissions,
      );

      if (!hasEnabledPermissions(sanitizedPermissions)) {
        return res.status(400).json({
          success: false,
          message:
            "Please assign at least one staff permission before creating the user",
        });
      }
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      roles: roles.trim(),
      staffType: finalStaffType,
      permissions: sanitizedPermissions,
      password,
      isVerified: true,
      verifiedBy: req.user?.name || "Internal",
      verifiedAt: new Date(),
      createdFrom: "internal",
    });

    // Populate the staff type and assigned cards
    await user.populate(staffTypePopulateOptions);

    res.status(201).json({
      success: true,
      message: "Staff user created successfully",
      user: buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create staff user",
    });
  }
};

export const updateStaffUser = async (req, res) => {
  try {
    const { name, email, roles, staffType, password } = req.body;

    const user = await User.findById(req.params.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!name || !email || !roles) {
      return res.status(400).json({
        success: false,
        message: "Name, email and roles are required",
      });
    }

    let finalStaffType = null;

    try {
      finalStaffType = await validateStaffTypeForRole(roles, staffType);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.params.id },
    })
      .select("_id")
      .lean();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    user.name = name.trim();
    user.email = normalizedEmail;
    user.roles = roles.trim();
    user.staffType = finalStaffType;

    if (isSuperadminRole(user.roles)) {
      user.permissions = {};
    } else {
      const nextStaffType = await StaffType.findById(finalStaffType)
        .populate(staffTypePopulateOptions.populate)
        .select("assignedCards")
        .lean();

      user.permissions = sanitizePermissionsForAssignedCards(
        nextStaffType?.assignedCards || [],
        user.permissions,
      );
    }

    if (password && password.trim()) {
      user.password = password.trim();
      user.passwordChangeRequest = false;
      user.passwordChangeRequestAt = null;
      user.passwordChangeRequestMessage = "Password updated successfully";
    }

    await user.save();
    await user.populate(staffTypePopulateOptions);

    res.status(200).json({
      success: true,
      message: "Staff user updated successfully",
      user: buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update staff user",
    });
  }
};

export const verifyStaffUser = async (req, res) => {
  try {
    if (String(req.user?.roles || "").toLowerCase() !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can verify users",
      });
    }

    const user = await User.findById(req.params.id).populate(
      staffTypePopulateOptions,
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      user.createdFrom === "public" &&
      !isSuperadminRole(user.roles) &&
      !hasEnabledPermissions(user.permissions)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please assign staff permissions first, then verify this public user",
      });
    }

    user.isVerified = true;
    user.verifiedBy = req.user?.name || "Superadmin";
    user.verifiedAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: "User verified successfully",
      user: buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Verification failed",
    });
  }
};

export const clearPasswordRequest = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.passwordChangeRequest = false;
    user.passwordChangeRequestAt = null;
    user.passwordChangeRequestMessage = "";

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password request cleared successfully",
      user: buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to clear password request",
    });
  }
};

export const getUserPermissions = async (req, res) => {
  try {
    if (!ensureSuperadminRequest(req, res)) {
      return;
    }

    const user = await User.findById(req.params.id)
      .populate(staffTypePopulateOptions)
      .select("permissions staffType")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      permissions: user.permissions || {},
      staffType: user.staffType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get user permissions",
    });
  }
};

export const updateUserPermissions = async (req, res) => {
  try {
    if (!ensureSuperadminRequest(req, res)) {
      return;
    }

    const { permissions } = req.body;

    if (!permissions || typeof permissions !== "object") {
      return res.status(400).json({
        success: false,
        message: "Permissions object is required",
      });
    }

    const user = await User.findById(req.params.id)
      .populate(staffTypePopulateOptions)
      .select("roles permissions staffType");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.permissions = isSuperadminRole(user.roles)
      ? {}
      : sanitizePermissionsForAssignedCards(
          user.staffType?.assignedCards || [],
          permissions,
        );
    await user.save();

    res.status(200).json({
      success: true,
      message: "User permissions updated successfully",
      permissions: user.permissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update user permissions",
    });
  }
};
export const deleteStaffUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      user: buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Delete failed",
    });
  }
};
