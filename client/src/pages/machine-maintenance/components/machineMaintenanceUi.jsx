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
  shadow:
    "0 0 0 1px rgba(15, 23, 42, 0.03), 0 12px 30px rgba(15, 23, 42, 0.08)",
  shadowStrong:
    "0 0 0 1px rgba(15, 23, 42, 0.04), 0 16px 40px rgba(15, 23, 42, 0.10)",
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
  background: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%)`,
  boxShadow: "0 12px 24px rgba(16, 108, 107, 0.20)",
  "&:hover": {
    background: `linear-gradient(135deg, ${brand.primaryDark} 0%, ${brand.primaryDark} 100%)`,
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
  "& .MuiOutlinedInput-root": {
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    boxShadow: brand.shadow,
    "& fieldset": {
      borderColor: brand.border,
    },
    "&:hover fieldset": {
      borderColor: brand.primaryLight,
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
      {
        name: "plant",
        label: "Plant / Site",
        required: true,
        select: true,
        options: [],
      },
      {
        name: "department",
        label: "Department",
        required: true,
        select: true,
        options: [],
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
        options: [],
      },
      {
        name: "status",
        label: "Status",
        required: true,
        select: true,
        options: [],
      },
      { name: "powerRating", label: "Power Rating / Capacity" },
      {
        name: "technicalSpecifications",
        label: "Technical Specifications",
      },
      {
        name: "operatingManual",
        label: "Operating Manual",
        type: "file",
        accept:
          ".pdf,.jpg,.jpeg,.png,.mp4,.mpeg,.mpg,.mov,.avi,.wmv,.webm,.flv,.3gp,.3g2,.ogv,.ts,.m2ts,.mts,.mkv,.m4v",
      },
      {
        name: "machineImage",
        label: "Machine Image",
        type: "file",
        accept:
          ".pdf,.jpg,.jpeg,.png,.mp4,.mpeg,.mpg,.mov,.avi,.wmv,.webm,.flv,.3gp,.3g2,.ogv,.ts,.m2ts,.mts,.mkv,.m4v",
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
      },
      {
        name: "linkedMachine",
        label: "Linked Machine",
        select: true,
        options: [],
      },
      { name: "partCategory", label: "Part Category" },
      { name: "vendor", label: "OEM / Supplier", required: true },
      { name: "partNo", label: "Part Number", required: true },
      {
        name: "unit",
        label: "Unit of Measure",
        required: true,
        select: true,
        options: [],
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
        options: [],
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
        options: [],
      },
      {
        name: "applicableMachine",
        label: "Applicable Machine",
        required: true,
        select: true,
        options: [],
      },
      {
        name: "frequency",
        label: "Frequency",
        required: true,
        select: true,
        options: [],
      },
      {
        name: "assignedUser",
        label: "Assigned User",
        required: true,
        select: true,
        options: [],
      },
      { name: "shift", label: "Shift", select: true, options: [] },
      { name: "startDate", label: "Start Date", required: true, type: "date" },
      { name: "endDate", label: "End Date", required: true, type: "date" },
      { name: "estimatedDuration", label: "Estimated Duration" },
      { name: "requiredManpower", label: "Required Manpower" },
      { name: "requiredTools", label: "Required Tools" },
      { name: "requiredSpareParts", label: "Required Spare Parts" },
      {
        name: "checklistSteps",
        label: "Checklist Steps",
      },
      {
        name: "instructions",
        label: "SOP / Instructions",
      },
      {
        name: "safetyPrecautions",
        label: "Safety Precautions / LOTO",
      },
      { name: "skillRequirement", label: "Skill Requirement" },
      { name: "escalationLevel", label: "Escalation Level" },
      {
        name: "status",
        label: "Status",
        required: true,
        select: true,
        options: [],
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
        options: [],
      },
      { name: "skillSet", label: "Skill Set" },
      { name: "shift", label: "Shift", select: true, options: [] },
      { name: "mobileNumber", label: "Mobile Number" },
      { name: "email", label: "Email", type: "email" },
      { name: "supervisor", label: "Supervisor" },
      {
        name: "machine",
        label: "Machine",
        select: true,
        options: [],
      },
      { name: "task", label: "Task" },
      { name: "accessRights", label: "Access Rights" },
      {
        name: "status",
        label: "Status",
        required: true,
        select: true,
        options: [],
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
        options: [],
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
      },
      {
        name: "status",
        label: "Status",
        required: true,
        select: true,
        options: [],
      },
    ],
  },
};

const getDynamicColumnWidth = (field) => {
  if (field.multiline) return "260px";
  if (field.type === "file") return "260px";
  if (field.type === "date") return "160px";
  if (field.type === "number") return "140px";
  if (field.select) return "180px";
  return "190px";
};

const getDynamicColumnType = (field) => {
  if (field.name === "status") return "status";
  if (field.name === "criticality") return "status";
  if (field.type === "file") return "file";
  return "text";
};

const createColumnsFromFields = (fields = []) =>
  fields.map((field) => ({
    key: field.name,
    label: field.label,
    width: getDynamicColumnWidth(field),
    type: getDynamicColumnType(field),
    nowrap:
      field.type === "date" ||
      field.type === "number" ||
      field.type === "file" ||
      field.select,
  }));

export const pageTableData = {
  assetList: {
    columns: createColumnsFromFields(pageFormData.assetRegister.fields),
    rows: [],
  },

  spareList: {
    columns: createColumnsFromFields(pageFormData.spareRegister.fields),
    rows: [],
  },

  taskList: {
    columns: createColumnsFromFields(pageFormData.taskSchedule.fields),
    rows: [],
  },

  userList: {
    columns: createColumnsFromFields(pageFormData.userAllocation.fields),
    rows: [],
  },

  vendorList: {
    columns: createColumnsFromFields(pageFormData.vendorRegister.fields),
    rows: [],
  },

  breakdownList: {
    columns: [
      { key: "breakdownCode", label: "Breakdown ID", width: "180px" },
      { key: "machineName", label: "Machine", width: "220px" },
      { key: "issueType", label: "Issue Type", width: "200px" },
      { key: "priority", label: "Priority", width: "150px" },
      { key: "reportedBy", label: "Reported By", width: "180px" },
      { key: "status", label: "Status", width: "150px", type: "status" },
    ],
    rows: [],
  },

  consumeList: {
    columns: [
      { key: "entryNo", label: "Entry No", width: "180px" },
      { key: "itemName", label: "Asset / Spare", width: "220px" },
      { key: "requestedBy", label: "Requested By", width: "180px" },
      { key: "issueDate", label: "Issue Date", width: "150px" },
      { key: "unit", label: "Unit", width: "120px" },
      { key: "consumeQty", label: "Consume Qty", width: "150px" },
      { key: "status", label: "Status", width: "150px", type: "status" },
    ],
    rows: [],
  },
};
