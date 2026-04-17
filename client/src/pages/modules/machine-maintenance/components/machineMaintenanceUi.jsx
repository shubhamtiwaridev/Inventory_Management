export const brand = {
  primary: "#106C6B",
  primaryDark: "#0C5A58",
  primaryLight: "#17A89F",
  soft: "#E8F7F6",
  softAlt: "#FFFFFF",
  border: "rgba(16, 108, 107, 0.24)",
  rowBorder: "rgba(16, 108, 107, 0.24)",
  verticalBorder: "#C7D7D7",
  text: "#143736",
  textSoft: "#617776",
  pageBg: "#FFFFFF",
  danger: "#C2410C",
  dangerSoft: "#FFF1EE",
  fieldBg: "#F8FCFC",
  muted: "#5F6F73",
};

export const filledActionButtonSx = {
  borderRadius: 3,
  px: 2,
  py: 1.15,
  textTransform: "none",
  fontWeight: 700,
  backgroundColor: brand.primary,
  boxShadow: "none",
  "&:hover": {
    backgroundColor: brand.primaryDark,
    boxShadow: "none",
  },
};

export const outlinedActionButtonSx = {
  borderRadius: 3,
  px: 2,
  py: 1.15,
  textTransform: "none",
  fontWeight: 700,
  color: brand.text,
  borderColor: brand.border,
  "&:hover": {
    borderColor: brand.primaryLight,
    backgroundColor: brand.soft,
  },
};

export const actionIconButtonSx = {
  width: 34,
  height: 34,
  borderRadius: 2.5,
  border: `1px solid ${brand.border}`,
  backgroundColor: "#FFFFFF",
  "&:hover": {
    backgroundColor: brand.soft,
  },
};

export const searchFieldSx = {
  width: { xs: "100%", lg: 320 },
  "& .MuiInputLabel-root": {
    color: brand.muted,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: brand.primaryDark,
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    backgroundColor: brand.fieldBg,
    "& fieldset": {
      borderColor: brand.border,
    },
    "&:hover fieldset": {
      borderColor: brand.primary,
    },
    "&.Mui-focused fieldset": {
      borderColor: brand.primary,
    },
  },
};

export const textFieldStyles = {
  "& .MuiInputLabel-root": {
    color: brand.muted,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: brand.primaryDark,
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "16px",
    backgroundColor: brand.fieldBg,
    "& fieldset": {
      borderColor: brand.border,
    },
    "&:hover fieldset": {
      borderColor: brand.primary,
    },
    "&.Mui-focused fieldset": {
      borderColor: brand.primary,
    },
  },
};

export const getCellSx = ({ isLast = false, align = "center" } = {}) => ({
  borderBottom: `1px solid ${brand.rowBorder}`,
  borderRight: isLast ? "none" : `2px solid ${brand.verticalBorder}`,
  py: 2.1,
  px: 2,
  textAlign: align,
  verticalAlign: "middle",
  boxSizing: "border-box",
  backgroundColor: "inherit",
});

const statusOptions = [
  "Active",
  "Pending",
  "Running",
  "Idle",
  "Under Maintenance",
  "Breakdown",
  "Retired",
];

const machineOptions = ["CNC Machine 01", "Hydraulic Press", "Lathe Machine"];
const departmentOptions = ["Production", "Maintenance", "Utility", "Quality"];
const shiftOptions = ["Morning", "Evening", "Night", "General"];

export const pageTableData = {
  assetList: {
    columns: [
      { key: "assetCode", label: "Asset Code", width: "14%" },
      { key: "assetName", label: "Machine Name", width: "20%" },
      { key: "category", label: "Category", width: "14%" },
      { key: "serialNumber", label: "Serial Number", width: "16%" },
      { key: "department", label: "Department", width: "14%" },
      { key: "installDate", label: "Install Date", width: "14%" },
      { key: "status", label: "Status", width: "12%", type: "status" },
    ],
    rows: [],
  },

  spareList: {
    columns: [
      { key: "spareCode", label: "Spare Code", width: "14%" },
      { key: "spareName", label: "Spare Name", width: "18%" },
      { key: "partNo", label: "Part No", width: "14%" },
      { key: "unit", label: "Unit", width: "10%" },
      { key: "minQty", label: "Min Qty", width: "12%" },
      { key: "maxQty", label: "Max Qty", width: "12%" },
      { key: "vendor", label: "Vendor", width: "16%" },
      { key: "status", label: "Status", width: "12%", type: "status" },
    ],
    rows: []
      
  },

  taskList: {
    columns: [
      { key: "taskCode", label: "Task Code", width: "14%" },
      { key: "taskName", label: "Task Name", width: "20%" },
      { key: "frequency", label: "Frequency", width: "14%" },
      { key: "assignedUser", label: "Assigned User", width: "18%" },
      { key: "startDate", label: "Start Date", width: "12%" },
      { key: "endDate", label: "End Date", width: "12%" },
      { key: "shift", label: "Shift", width: "10%" },
      { key: "status", label: "Status", width: "12%", type: "status" },
    ],
    rows: [],
  },

  userList: {
    columns: [
      { key: "employeeId", label: "Employee ID", width: "14%" },
      { key: "userName", label: "User Name", width: "20%" },
      { key: "machine", label: "Machine / Asset", width: "18%" },
      { key: "task", label: "Task", width: "18%" },
      { key: "shift", label: "Shift", width: "12%" },
      { key: "status", label: "Status", width: "12%", type: "status" },
    ],
    rows: [],
  },

  vendorList: {
    columns: [
      { key: "vendorCode", label: "Vendor Code", width: "14%" },
      { key: "vendorName", label: "Vendor Name", width: "18%" },
      { key: "contactPerson", label: "Contact Person", width: "18%" },
      { key: "phone", label: "Phone", width: "14%" },
      { key: "email", label: "Email", width: "18%" },
      { key: "city", label: "City", width: "10%" },
      { key: "contractType", label: "Contract Type", width: "14%" },
      { key: "status", label: "Status", width: "12%", type: "status" },
    ],
    rows: [],
  },

  breakdownList: {
    columns: [
      { key: "breakdownCode", label: "Breakdown ID", width: "14%" },
      { key: "machineName", label: "Machine", width: "20%" },
      { key: "issueType", label: "Issue Type", width: "18%" },
      { key: "priority", label: "Priority", width: "12%" },
      { key: "reportedBy", label: "Reported By", width: "18%" },
      { key: "status", label: "Status", width: "12%", type: "status" },
    ],
    rows: [],
  },

  consumeList: {
    columns: [
      { key: "entryNo", label: "Entry No", width: "14%" },
      { key: "itemName", label: "Asset / Spare", width: "20%" },
      { key: "requestedBy", label: "Requested By", width: "18%" },
      { key: "issueDate", label: "Issue Date", width: "14%" },
      { key: "unit", label: "Unit", width: "10%" },
      { key: "consumeQty", label: "Consume Qty", width: "12%" },
      { key: "status", label: "Status", width: "12%", type: "status" },
    ],
    rows: [],
  },
};

export const pageFormData = {
  assetRegister: {
    title: "Machine Registration",
    primaryActionLabel: "Save",
    secondaryActionLabel: "Reset",
    successMessage: "Machine registered successfully.",
    fields: [
      { name: "assetCode", label: "Machine ID / Asset Code", required: true },
      { name: "assetName", label: "Machine Name", required: true },
      { name: "category", label: "Machine Category", required: true },
      { name: "plant", label: "Plant / Site", required: true },
      {
        name: "department",
        label: "Department",
        required: true,
        select: true,
        options: departmentOptions,
      },
      { name: "manufacturer", label: "OEM / Manufacturer", required: true },
      { name: "modelNumber", label: "Model Number" },
      { name: "serialNumber", label: "Serial Number", required: true },
      { name: "commissioningDate", label: "Commissioning Date", type: "date" },
      { name: "purchaseDate", label: "Purchase Date", type: "date" },
      { name: "warrantyStart", label: "Warranty Start", type: "date" },
      { name: "warrantyEnd", label: "Warranty End", type: "date" },
      {
        name: "criticality",
        label: "Criticality Level",
        select: true,
        options: ["Low", "Medium", "High", "Critical"],
      },
      {
        name: "status",
        label: "Status",
        required: true,
        select: true,
        options: statusOptions,
        defaultValue: "Running",
      },
      { name: "powerRating", label: "Power Rating / Capacity" },
      {
        name: "technicalSpecifications",
        label: "Technical Specifications",
        multiline: true,
        minRows: 3,
      },
      {
        name: "operatingManual",
        label: "Operating Manual",
        type: "file",
        accept: ".pdf,.doc,.docx",
      },
      {
        name: "machineImage",
        label: "Machine Image",
        type: "file",
        accept: "image/*",
      },
      { name: "qrCode", label: "QR Code / Barcode" },
    ],
  },

  spareRegister: {
    title: "Spare Registration",
    primaryActionLabel: "Save",
    secondaryActionLabel: "Reset",
    successMessage: "Spare registered successfully.",
    fields: [
      { name: "spareCode", label: "Spare Part Code", required: true },
      { name: "spareName", label: "Spare Part Name", required: true },
      {
        name: "description",
        label: "Description",
        multiline: true,
        minRows: 3,
      },
      {
        name: "linkedMachine",
        label: "Linked Machine",
        select: true,
        options: machineOptions,
      },
      { name: "partCategory", label: "Part Category" },
      { name: "vendor", label: "OEM / Supplier", required: true },
      { name: "partNo", label: "Part Number", required: true },
      {
        name: "unit",
        label: "Unit of Measure",
        required: true,
        select: true,
        options: ["PCS", "SET", "LTR", "KG"],
      },
      { name: "reorderLevel", label: "Reorder Level", type: "number" },
      {
        name: "minQty",
        label: "Minimum Stock",
        type: "number",
        required: true,
      },
      {
        name: "maxQty",
        label: "Maximum Stock",
        type: "number",
        required: true,
      },
      { name: "currentStock", label: "Current Stock", type: "number" },
      { name: "leadTime", label: "Lead Time (days)", type: "number" },
      { name: "costPerUnit", label: "Cost Per Unit", type: "number" },
      { name: "alternatePart", label: "Alternate Part" },
      { name: "shelfLocation", label: "Shelf / Bin Location" },
      { name: "batchNo", label: "Batch / Lot Number" },
      {
        name: "status",
        label: "Status",
        required: true,
        select: true,
        options: statusOptions,
        defaultValue: "Active",
      },
    ],
  },

  taskSchedule: {
    title: "Task Schedule",
    primaryActionLabel: "Save",
    secondaryActionLabel: "Reset",
    successMessage: "Task scheduled successfully.",
    fields: [
      { name: "taskCode", label: "Task ID", required: true },
      { name: "taskName", label: "Task Title", required: true },
      {
        name: "taskCategory",
        label: "Task Category",
        required: true,
        select: true,
        options: [
          "Preventive",
          "Corrective",
          "Predictive",
          "Calibration",
          "Safety",
        ],
      },
      {
        name: "applicableMachine",
        label: "Applicable Machine",
        required: true,
        select: true,
        options: machineOptions,
      },
      {
        name: "frequency",
        label: "Frequency",
        required: true,
        select: true,
        options: ["Daily", "Weekly", "Monthly", "Runtime-based"],
      },
      { name: "assignedUser", label: "Assigned User", required: true },
      { name: "shift", label: "Shift", select: true, options: shiftOptions },
      { name: "startDate", label: "Start Date", required: true, type: "date" },
      { name: "endDate", label: "End Date", required: true, type: "date" },
      { name: "estimatedDuration", label: "Estimated Duration" },
      { name: "requiredManpower", label: "Required Manpower" },
      { name: "requiredTools", label: "Required Tools" },
      { name: "requiredSpareParts", label: "Required Spare Parts" },
      {
        name: "checklistSteps",
        label: "Checklist Steps",
        multiline: true,
        minRows: 3,
      },
      {
        name: "instructions",
        label: "SOP / Instructions",
        multiline: true,
        minRows: 3,
      },
      {
        name: "safetyPrecautions",
        label: "Safety Precautions / LOTO",
        multiline: true,
        minRows: 3,
      },
      { name: "skillRequirement", label: "Skill Requirement" },
      { name: "escalationLevel", label: "Escalation Level" },
      {
        name: "status",
        label: "Status",
        required: true,
        select: true,
        options: statusOptions,
        defaultValue: "Active",
      },
    ],
  },

  userAllocation: {
    title: "User Allocation",
    primaryActionLabel: "Save",
    secondaryActionLabel: "Reset",
    successMessage: "User allocation saved successfully.",
    fields: [
      { name: "employeeId", label: "Employee ID", required: true },
      { name: "userName", label: "Name", required: true },
      { name: "role", label: "Role", required: true },
      {
        name: "department",
        label: "Department",
        select: true,
        options: departmentOptions,
      },
      { name: "skillSet", label: "Skill Set" },
      { name: "shift", label: "Shift", select: true, options: shiftOptions },
      { name: "mobileNumber", label: "Mobile Number" },
      { name: "email", label: "Email", type: "email" },
      { name: "supervisor", label: "Supervisor" },
      {
        name: "machine",
        label: "Machine",
        select: true,
        options: machineOptions,
      },
      { name: "task", label: "Task" },
      { name: "accessRights", label: "Access Rights" },
      {
        name: "status",
        label: "Status",
        required: true,
        select: true,
        options: statusOptions,
        defaultValue: "Active",
      },
    ],
  },

  vendorRegister: {
    title: "Vendor Registration",
    primaryActionLabel: "Save",
    secondaryActionLabel: "Reset",
    successMessage: "Vendor registered successfully.",
    fields: [
      { name: "vendorCode", label: "Vendor Code", required: true },
      { name: "vendorName", label: "Vendor Name", required: true },
      { name: "contactPerson", label: "Contact Person", required: true },
      { name: "phone", label: "Phone", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "city", label: "City" },
      {
        name: "contractType",
        label: "Contract Type",
        required: true,
        select: true,
        options: ["AMC", "Service", "Supply", "On-call"],
      },
      { name: "sla", label: "SLA" },
      { name: "machinesCovered", label: "Machines Covered" },
      {
        name: "contractValidityFrom",
        label: "Contract Valid From",
        type: "date",
      },
      { name: "contractValidityTo", label: "Contract Valid To", type: "date" },
      {
        name: "escalationContacts",
        label: "Escalation Contacts",
        multiline: true,
        minRows: 3,
      },
      {
        name: "status",
        label: "Status",
        required: true,
        select: true,
        options: statusOptions,
        defaultValue: "Active",
      },
    ],
  },
};
