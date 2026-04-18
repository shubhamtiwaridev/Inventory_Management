import Department from "./departmentModel.js";

const getUserName = (req) =>
  req.user?.name || req.user?.username || req.user?.email || "System";

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.status(200).json({ data: departments });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch departments" });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({ data: department });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch department" });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const departmentValue = String(req.body.department || "").trim();

    if (!departmentValue) {
      return res.status(400).json({ message: "Department is required" });
    }

    const existingDepartment = await Department.findOne({
      department: new RegExp(`^${departmentValue}$`, "i"),
    });

    if (existingDepartment) {
      return res.status(400).json({ message: "Department already exists" });
    }

    const department = await Department.create({
      department: departmentValue,
      createdBy: getUserName(req),
    });

    res.status(201).json({
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create department" });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const departmentValue = String(req.body.department || "").trim();

    if (!departmentValue) {
      return res.status(400).json({ message: "Department is required" });
    }

    const existingDepartment = await Department.findOne({
      _id: { $ne: req.params.id },
      department: new RegExp(`^${departmentValue}$`, "i"),
    });

    if (existingDepartment) {
      return res.status(400).json({ message: "Department already exists" });
    }

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      {
        department: departmentValue,
        createdBy: getUserName(req),
      },
      { new: true, runValidators: true },
    );

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({
      message: "Department updated successfully",
      data: department,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update department" });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete department" });
  }
};
