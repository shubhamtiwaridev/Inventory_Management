import User from "../../auth/authModel.js";

const buildUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  roles: user.roles,
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

export const getStaffUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

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
    const { name, email, roles, password } = req.body;

    if (!name || !email || !roles || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, roles and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      roles: roles.trim(),
      password,
      isVerified: true,
      verifiedBy: req.user?.name || "Internal",
      verifiedAt: new Date(),
      createdFrom: "internal",
    });

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
    const { name, email, roles, password } = req.body;

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

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.params.id },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    user.name = name.trim();
    user.email = normalizedEmail;
    user.roles = roles.trim();

    if (password && password.trim()) {
      user.password = password.trim();
      user.passwordChangeRequest = false;
      user.passwordChangeRequestAt = null;
      user.passwordChangeRequestMessage = "Password updated successfully";
    }

    await user.save();

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

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Delete failed",
    });
  }
};
