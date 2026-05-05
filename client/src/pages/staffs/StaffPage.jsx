import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import { useAuth } from "../../store/AuthContext.jsx";
import {
  getStaffUsers,
  createStaffUser,
  updateStaffUser,
  deleteStaffUser,
  verifyStaffUser,
  clearPasswordRequest,
  getStaffTypes,
  getUserPermissions,
  updateUserPermissions,
} from "./staffApi";
import {
  ACTIONS,
  ACTION_LABELS,
  buildPermissionKey,
  filterUserPermissionsForCards,
  getCardSections,
  getDefaultPermissionRecord,
  getPermissionCardsForStaffType,
  getSectionFeatures,
  initializeUserPermissions,
} from "../../utils/permissions.js";

const brand = {
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

const tabs = [
  { label: "STAFF", icon: <BadgeRoundedIcon />, path: "/staff" },
  { label: "STAFF LIST", icon: <FactCheckOutlinedIcon />, path: "/staff-list" },
  {
    label: "STAFF TYPE",
    icon: <VerifiedUserOutlinedIcon />,
    path: "/staff-type",
  },
];

const softCardSx = {
  borderRadius: 4,
  border: `1px solid ${brand.border}`,
  backgroundColor: "#FFFFFF",
  boxShadow: "none",
};

const tabButtonSx = (active) => ({
  borderRadius: 0,
  px: 2.25,
  py: 1.4,
  minWidth: 108,
  color: active ? "#111111" : "#444444",
  fontWeight: active ? 800 : 700,
  textTransform: "none",
  borderBottom: active ? "3px solid #111111" : "3px solid transparent",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 0.55,
  "& .tab-icon": {
    color: active ? "#111111" : "#444444",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  "& .tab-icon svg": {
    fontSize: 24,
  },
  "& .tab-label": {
    fontSize: "0.95rem",
    lineHeight: 1.1,
    whiteSpace: "nowrap",
  },
  "&:hover": {
    backgroundColor: "transparent",
    color: "#111111",
  },
});

const actionButtonSx = {
  width: 34,
  height: 34,
  borderRadius: 2.5,
  border: `1px solid ${brand.border}`,
  backgroundColor: "#FFFFFF",
  "&:hover": {
    backgroundColor: brand.soft,
  },
};

const getCellSx = ({ isLast = false, align = "center" } = {}) => ({
  borderBottom: `1px solid ${brand.rowBorder}`,
  borderRight: isLast ? "none" : `2px solid ${brand.verticalBorder}`,
  py: 2.1,
  px: 2,
  textAlign: align,
  verticalAlign: "middle",
  boxSizing: "border-box",
  backgroundColor: "inherit",
});

const textFieldStyles = {
  "& .MuiInputLabel-root": {
    color: brand.muted,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: brand.primaryDark,
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "16px",
    bgcolor: brand.fieldBg,
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

const hiddenScrollbarSx = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
    width: 0,
    height: 0,
  },
};

const pad = (value) => String(value).padStart(2, "0");

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  const hours = date.getHours();
  const hours12 = hours % 12 || 12;
  const amPm = hours >= 12 ? "PM" : "AM";

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${hours12}:${pad(date.getMinutes())} ${amPm}`;
};

const StaffPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [savingRegister, setSavingRegister] = useState(false);
  const [staffTypes, setStaffTypes] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerUserPermissions, setRegisterUserPermissions] = useState({});
  const [registerExpandedPermissionSections, setRegisterExpandedPermissionSections] =
    useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    roles: "",
    password: "",
    confirmPassword: "",
  });

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    roles: "",
    password: "",
    requestPending: false,
  });

  const [userPermissions, setUserPermissions] = useState({});
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [expandedPermissionSections, setExpandedPermissionSections] = useState(
    {},
  );

  const isSuperadmin = useMemo(
    () => String(user?.roles || "").toLowerCase() === "superadmin",
    [user?.roles],
  );

  const isSuperadminRole = (role) =>
    String(role || "")
      .trim()
      .toLowerCase() === "superadmin";

  const isRegisterSuperadmin = isSuperadminRole(formData.roles);
  const isEditSuperadmin = isSuperadminRole(editFormData.roles);

  const selectedRegisterStaffType = useMemo(() => {
    if (!formData.roles) return null;

    const roleName = String(formData.roles || "")
      .trim()
      .toLowerCase();

    return (
      staffTypes.find(
        (type) =>
          String(type.name || "")
            .trim()
            .toLowerCase() === roleName,
      ) || null
    );
  }, [staffTypes, formData.roles]);

  const selectedEditStaffType = useMemo(() => {
    if (!editFormData.roles) return null;

    const roleName = String(editFormData.roles || "")
      .trim()
      .toLowerCase();

    return (
      staffTypes.find(
        (type) =>
          String(type.name || "")
            .trim()
            .toLowerCase() === roleName,
      ) || null
    );
  }, [staffTypes, editFormData.roles]);

  const selectedPermissionCards = useMemo(
    () => getPermissionCardsForStaffType(selectedEditStaffType),
    [selectedEditStaffType],
  );

  const selectedRegisterPermissionCards = useMemo(
    () => getPermissionCardsForStaffType(selectedRegisterStaffType),
    [selectedRegisterStaffType],
  );

  const buildSectionKey = (cardName, sectionLabel) =>
    `${cardName}::${sectionLabel}`;

  const getInitialExpandedSections = (
    permissionCards,
    permissions,
    fallbackExpanded = false,
  ) =>
    permissionCards.reduce((acc, card) => {
      getCardSections(card).forEach((section) => {
        const features = getSectionFeatures(section);
        const isExpanded =
          features.some((feature) =>
            Boolean(
              permissions?.[buildPermissionKey(card.name, feature.label)]
                ?.enabled,
            ),
          ) || fallbackExpanded;

        if (isExpanded) {
          acc[buildSectionKey(card.name, section.label)] = true;
        }
      });

      return acc;
    }, {});

  const roleOptions = useMemo(() => {
    const names = staffTypes
      .map((item) => item.name)
      .filter(Boolean)
      .filter((name) => !isSuperadminRole(name));

    return ["superadmin", ...names];
  }, [staffTypes]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getStaffUsers();

      const users = Array.isArray(data?.users)
        ? data.users
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];

      setStaffList(users);
    } catch (err) {
      setError(err.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const loadStaffTypes = async () => {
    try {
      setLoadingRoles(true);
      setRegisterError("");

      const data = await getStaffTypes();

      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.staffTypes)
          ? data.staffTypes
          : Array.isArray(data)
            ? data
            : [];

      setStaffTypes(list);
    } catch (err) {
      setRegisterError(err.message || "Failed to load roles");
    } finally {
      setLoadingRoles(false);
    }
  };
  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return staffList;

    return staffList.filter((row) => {
      const name = String(row.name || "").toLowerCase();
      const roles = String(row.roles || "").toLowerCase();
      const passwordStatus = (
        row.passwordChangeRequest
          ? "request pending"
          : row.passwordChangeRequestMessage || "no request"
      ).toLowerCase();
      const requestTime = row.passwordChangeRequest
        ? formatDateTime(row.passwordChangeRequestAt).toLowerCase()
        : "-";
      const status = (
        row.isVerified === false ? "pending" : "active"
      ).toLowerCase();

      return (
        name.includes(keyword) ||
        roles.includes(keyword) ||
        passwordStatus.includes(keyword) ||
        requestTime.includes(keyword) ||
        status.includes(keyword)
      );
    });
  }, [search, staffList]);

  const resetRegisterForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      roles: "",
      password: "",
      confirmPassword: "",
    });
    setRegisterError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRegisterUserPermissions({});
    setRegisterExpandedPermissionSections({});
  };

  const resetEditForm = () => {
    setEditFormData({
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      roles: "",
      password: "",
      requestPending: false,
    });
    setEditError("");
    setShowEditPassword(false);
  };

  const handleOpenEdit = async (row) => {
    await loadStaffTypes();

    const parts = String(row.name || "")
      .trim()
      .split(" ");

    setEditFormData({
      id: row._id,
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" "),
      email: row.email || "",
      roles: row.roles || "",
      password: "",
      requestPending: !!row.passwordChangeRequest,
    });

    if (isSuperadmin) {
      try {
        setLoadingPermissions(true);
        const response = await getUserPermissions(row._id);
        const permissions = response.permissions || {};
        const normalizedPermissions = filterUserPermissionsForCards(
          row.staffType?.assignedCards || [],
          permissions,
        );

        // If user has no custom permissions, initialize based on staff type
        if (
          Object.keys(normalizedPermissions).length === 0 &&
          row.staffType?.assignedCards
        ) {
          const initializedPermissions = initializeUserPermissions(
            row.staffType.assignedCards,
          );
          setUserPermissions(initializedPermissions);
          setExpandedPermissionSections(
            getInitialExpandedSections(
              getPermissionCardsForStaffType(row.staffType),
              initializedPermissions,
              true,
            ),
          );
        } else {
          setUserPermissions(normalizedPermissions);
          setExpandedPermissionSections(
            getInitialExpandedSections(
              getPermissionCardsForStaffType(row.staffType),
              normalizedPermissions,
            ),
          );
        }
      } catch (error) {
        console.error("Failed to load user permissions:", error);
        setUserPermissions({});
        setExpandedPermissionSections({});
      } finally {
        setLoadingPermissions(false);
      }
    } else {
      setUserPermissions({});
      setExpandedPermissionSections({});
    }

    setEditError("");
    setOpenEditDialog(true);
  };

  const handleCloseEdit = () => {
    setOpenEditDialog(false);
    resetEditForm();
    setUserPermissions({});
    setExpandedPermissionSections({});
  };

  const handlePermissionEnabledChange = (
    cardName,
    feature,
    featureKey,
    enabled,
  ) => {
    setUserPermissions((prev) => ({
      ...prev,
      [featureKey]: {
        ...getDefaultPermissionRecord(cardName, feature),
        ...prev[featureKey],
        enabled,
        actions: enabled
          ? prev[featureKey]?.actions ||
            ACTIONS.reduce((acc, action) => {
              acc[action] = true;
              return acc;
            }, {})
          : ACTIONS.reduce((acc, action) => {
              acc[action] = false;
              return acc;
            }, {}),
      },
    }));
  };
  const handlePermissionActionChange = (
    cardName,
    feature,
    featureKey,
    action,
    checked,
  ) => {
    setUserPermissions((prev) => ({
      ...prev,
      [featureKey]: {
        ...getDefaultPermissionRecord(cardName, feature),
        ...prev[featureKey],
        enabled: prev[featureKey]?.enabled ?? true,
        actions: {
          ...getDefaultPermissionRecord(cardName, feature).actions,
          ...prev[featureKey]?.actions,
          [action]: checked,
        },
      },
    }));
  };

  const handleSectionEnabledChange = (card, section, enabled) => {
    const sectionKey = buildSectionKey(card.name, section.label);

    setExpandedPermissionSections((prev) => ({
      ...prev,
      [sectionKey]: enabled,
    }));

    setUserPermissions((prev) => {
      const nextPermissions = { ...prev };

      getSectionFeatures(section).forEach((feature) => {
        const featureKey = buildPermissionKey(card.name, feature.label);
        const defaultPermission = getDefaultPermissionRecord(card.name, feature);

        nextPermissions[featureKey] = {
          ...defaultPermission,
          ...nextPermissions[featureKey],
          enabled,
          actions: enabled
            ? nextPermissions[featureKey]?.actions || defaultPermission.actions
            : ACTIONS.reduce((acc, action) => {
                acc[action] = false;
                return acc;
              }, {}),
        };
      });

      return nextPermissions;
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (name === "roles") {
      if (isSuperadminRole(value)) {
        setUserPermissions({});
        setExpandedPermissionSections({});
      } else {
        const selectedStaffType = staffTypes.find(
          (type) =>
            String(type.name || "")
              .trim()
              .toLowerCase() ===
            String(value || "")
              .trim()
              .toLowerCase(),
        );

        const initializedPermissions = initializeUserPermissions(
          selectedStaffType?.assignedCards || [],
          true,
          true,
        );

        setUserPermissions(initializedPermissions);
        setExpandedPermissionSections(
          getInitialExpandedSections(
            getPermissionCardsForStaffType(selectedStaffType),
            initializedPermissions,
            true,
          ),
        );
      }
    }

    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegisterPermissionEnabledChange = (
    cardName,
    feature,
    featureKey,
    enabled,
  ) => {
    setRegisterUserPermissions((prev) => ({
      ...prev,
      [featureKey]: {
        ...getDefaultPermissionRecord(cardName, feature, false, false),
        ...prev[featureKey],
        enabled,
        actions: enabled
          ? prev[featureKey]?.actions ||
            ACTIONS.reduce((acc, action) => {
              acc[action] = true;
              return acc;
            }, {})
          : ACTIONS.reduce((acc, action) => {
              acc[action] = false;
              return acc;
            }, {}),
      },
    }));
  };

  const handleRegisterPermissionActionChange = (
    cardName,
    feature,
    featureKey,
    action,
    checked,
  ) => {
    setRegisterUserPermissions((prev) => ({
      ...prev,
      [featureKey]: {
        ...getDefaultPermissionRecord(cardName, feature, false, false),
        ...prev[featureKey],
        enabled: prev[featureKey]?.enabled ?? true,
        actions: {
          ...getDefaultPermissionRecord(cardName, feature, false, false).actions,
          ...prev[featureKey]?.actions,
          [action]: checked,
        },
      },
    }));
  };

  const handleRegisterSectionEnabledChange = (card, section, enabled) => {
    const sectionKey = buildSectionKey(card.name, section.label);

    setRegisterExpandedPermissionSections((prev) => ({
      ...prev,
      [sectionKey]: enabled,
    }));

    setRegisterUserPermissions((prev) => {
      const nextPermissions = { ...prev };

      getSectionFeatures(section).forEach((feature) => {
        const featureKey = buildPermissionKey(card.name, feature.label);
        const defaultPermission = getDefaultPermissionRecord(
          card.name,
          feature,
          false,
          false,
        );

        nextPermissions[featureKey] = {
          ...defaultPermission,
          ...nextPermissions[featureKey],
          enabled,
          actions: enabled
            ? nextPermissions[featureKey]?.actions ||
              ACTIONS.reduce((acc, action) => {
                acc[action] = true;
                return acc;
              }, {})
            : ACTIONS.reduce((acc, action) => {
                acc[action] = false;
                return acc;
              }, {}),
        };
      });

      return nextPermissions;
    });
  };

  const hasEnabledPermissions = (permissions = {}) =>
    Object.values(permissions).some((permission) => permission?.enabled);

  const handleSavePermissions = async () => {
    if (!isSuperadmin) {
      return;
    }

    try {
      setLoadingPermissions(true);
      const sanitizedPermissions = isEditSuperadmin
        ? {}
        : filterUserPermissionsForCards(
            selectedEditStaffType?.assignedCards || [],
            userPermissions,
          );

      await updateUserPermissions(editFormData.id, sanitizedPermissions);
      // Optionally show success message
    } catch (error) {
      console.error("Failed to save permissions:", error);
      setEditError("Failed to save permissions");
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError("");

    if (!editFormData.firstName.trim() || !editFormData.lastName.trim()) {
      setEditError("First name and last name are required");
      return;
    }

    if (!editFormData.email.trim()) {
      setEditError("Email is required");
      return;
    }

    if (!editFormData.roles.trim()) {
      setEditError("Role is required");
      return;
    }

    const selectedStaffType = staffTypes.find(
      (type) =>
        String(type.name || "")
          .trim()
          .toLowerCase() ===
        String(editFormData.roles || "")
          .trim()
          .toLowerCase(),
    );

    if (!isEditSuperadmin && !selectedStaffType) {
      setEditError("Role must match a staff type");
      return;
    }

    if (editFormData.requestPending && !editFormData.password.trim()) {
      setEditError("Please enter new password");
      return;
    }

    if (editFormData.password && editFormData.password.length < 8) {
      setEditError("Password must be at least 8 characters");
      return;
    }

    try {
      setSavingEdit(true);

      const response = await updateStaffUser(editFormData.id, {
        name: `${editFormData.firstName} ${editFormData.lastName}`.trim(),
        email: editFormData.email.trim().toLowerCase(),
        roles: editFormData.roles.trim(),
        staffType: isEditSuperadmin ? null : selectedStaffType._id,
        password: editFormData.password.trim(),
      });

      if (isSuperadmin) {
        await handleSavePermissions();
      }

      const updatedUser = response.user || response.data || response;

      setStaffList((prev) =>
        prev.map((item) => (item._id === editFormData.id ? updatedUser : item)),
      );

      handleCloseEdit();
    } catch (err) {
      setEditError(err.message || "Update failed");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleOpenRegister = async (event) => {
    event?.currentTarget?.blur();

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    resetRegisterForm();
    await loadStaffTypes();
    setOpenRegisterDialog(true);
  };

  const handleCloseRegister = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setOpenRegisterDialog(false);
    resetRegisterForm();
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;

    if (name === "roles") {
      if (isSuperadminRole(value)) {
        setRegisterUserPermissions({});
        setRegisterExpandedPermissionSections({});
      } else {
        const selectedStaffType = staffTypes.find(
          (type) =>
            String(type.name || "")
              .trim()
              .toLowerCase() ===
            String(value || "")
              .trim()
              .toLowerCase(),
        );

        const initializedPermissions = initializeUserPermissions(
          selectedStaffType?.assignedCards || [],
          false,
          false,
        );

        setRegisterUserPermissions(initializedPermissions);
        setRegisterExpandedPermissionSections(
          getInitialExpandedSections(
            getPermissionCardsForStaffType(selectedStaffType),
            initializedPermissions,
            false,
          ),
        );
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError("");

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setRegisterError("First name and last name are required");
      return;
    }

    if (!formData.email.trim()) {
      setRegisterError("Email is required");
      return;
    }

    if (!formData.roles.trim()) {
      setRegisterError("Role is required");
      return;
    }
    if (!isRegisterSuperadmin && !selectedRegisterStaffType) {
      setRegisterError("Role must match a staff type");
      return;
    }

    const sanitizedRegisterPermissions = isRegisterSuperadmin
      ? {}
      : filterUserPermissionsForCards(
          selectedRegisterStaffType?.assignedCards || [],
          registerUserPermissions,
        );

    if (
      !isRegisterSuperadmin &&
      !hasEnabledPermissions(sanitizedRegisterPermissions)
    ) {
      setRegisterError(
        "Please select at least one staff permission before registering",
      );
      return;
    }

    if (formData.password.length < 8) {
      setRegisterError("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setRegisterError("Passwords do not match");
      return;
    }

    try {
      setSavingRegister(true);

      await createStaffUser({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email.trim().toLowerCase(),
        roles: formData.roles.trim(),
        staffType: isRegisterSuperadmin ? null : selectedRegisterStaffType._id,
        password: formData.password,
        permissions: sanitizedRegisterPermissions,
      });

      handleCloseRegister();
      await fetchStaff();
    } catch (err) {
      setRegisterError(err.message || "Registration failed");
    } finally {
      setSavingRegister(false);
    }
  };

  const handleRefresh = () => {
    setSearch("");
    fetchStaff();
  };

  const handleDelete = async (id) => {
    try {
      await deleteStaffUser(id);

      setStaffList((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete user");
    }
  };

  const handleVerify = async (id) => {
    try {
      const data = await verifyStaffUser(id);
      const updatedUser = data.user || data.data || data;

      setStaffList((prev) =>
        prev.map((item) => (item._id === id ? updatedUser : item)),
      );
    } catch (err) {
      alert(err.message || "Failed to verify user");
    }
  };

  const handleCancelPasswordRequest = async (id) => {
    try {
      const data = await clearPasswordRequest(id);
      const updatedUser = data.user || data.data || data;

      setStaffList((prev) =>
        prev.map((item) => (item._id === id ? updatedUser : item)),
      );
    } catch (err) {
      alert(err.message || "Failed to cancel password request");
    }
  };
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: brand.pageBg,
      }}
    >
      <Box
        sx={{
          minWidth: 0,
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Box
          sx={{
            mb: 2,
            px: { xs: 1, sm: 2 },
            pt: 1,
            backgroundColor: "#FFFFFF",
            borderBottom: "none",
            overflowX: "auto",
          }}
        >
          <Stack
            direction="row"
            spacing={{ xs: 0.5, sm: 1.25 }}
            sx={{
              minWidth: "max-content",
              alignItems: "flex-end",
            }}
          >
            {tabs.map((tab) => {
              const active = location.pathname === tab.path;

              return (
                <Button
                  key={tab.label}
                  onClick={() => navigate(tab.path)}
                  sx={tabButtonSx(active)}
                >
                  <Box className="tab-icon">{tab.icon}</Box>
                  <Box component="span" className="tab-label">
                    {tab.label}
                  </Box>
                </Button>
              );
            })}
          </Stack>
        </Box>

        <Paper elevation={0} sx={{ ...softCardSx, overflow: "hidden" }}>
          <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack
              direction={{ xs: "column", lg: "row" }}
              justifyContent="space-between"
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                flexWrap="wrap"
                useFlexGap
              >
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={handleOpenRegister}
                  sx={{
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
                  }}
                >
                  New
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<RefreshRoundedIcon />}
                  onClick={handleRefresh}
                  sx={{
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
                  }}
                >
                  Refresh
                </Button>
              </Stack>

              <TextField
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                placeholder="Search name, role, status..."
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 280 },
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
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchRoundedIcon sx={{ color: brand.textSoft }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            <Dialog
              open={openRegisterDialog}
              onClose={handleCloseRegister}
              fullWidth
              maxWidth="sm"
              disableRestoreFocus
              scroll="paper"
              PaperProps={{
                sx: {
                  borderRadius: 4,
                  border: `1px solid ${brand.border}`,
                  boxShadow: brand.shadowStrong,
                  overflow: "hidden",
                  width: "100%",
                  maxWidth: { xs: "calc(100% - 24px)", sm: "640px" },
                  height: { xs: "92vh", sm: "86vh" },
                  maxHeight: { xs: "92vh", sm: "86vh" },
                  display: "flex",
                  flexDirection: "column",
                },
              }}
            >
              <DialogTitle
                sx={{
                  fontWeight: 800,
                  color: brand.text,
                  pb: 1,
                }}
              >
                Add New Staff
              </DialogTitle>

              <Box
                component="form"
                onSubmit={handleRegisterSubmit}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                <DialogContent
                  sx={{
                    pt: 1,
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    overflowX: "hidden",
                    ...hiddenScrollbarSx,
                  }}
                >
                  <Stack spacing={2}>
                    {registerError ? (
                      <Alert severity="error" sx={{ borderRadius: 2 }}>
                        {registerError}
                      </Alert>
                    ) : null}

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 2,
                      }}
                    >
                      <TextField
                        fullWidth
                        autoFocus
                        label="First Name"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleRegisterChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonOutlineIcon
                                sx={{ color: brand.primaryDark }}
                              />
                            </InputAdornment>
                          ),
                        }}
                        sx={textFieldStyles}
                      />

                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleRegisterChange}
                        sx={textFieldStyles}
                      />
                    </Box>

                    <TextField
                      fullWidth
                      label="Work Email"
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleRegisterChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MailOutlineIcon
                              sx={{ color: brand.primaryDark }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      sx={textFieldStyles}
                    />

                    <TextField
                      select
                      fullWidth
                      label="Roles"
                      name="roles"
                      value={formData.roles}
                      onChange={handleRegisterChange}
                      disabled={loadingRoles}
                      helperText={
                        loadingRoles ? "Loading roles..." : "Select a role"
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AdminPanelSettingsOutlinedIcon
                              sx={{ color: brand.primaryDark }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      sx={textFieldStyles}
                    >
                      <MenuItem value="">Select role</MenuItem>
                      {roleOptions.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </TextField>

                    {!isRegisterSuperadmin && (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: `1px solid ${brand.border}`,
                          backgroundColor: brand.soft,
                        }}
                      >
                        <Typography
                          sx={{ fontWeight: 800, mb: 1, color: brand.text }}
                        >
                          Staff Permissions *
                        </Typography>
                        <Typography
                          sx={{ color: brand.textSoft, mb: 2, fontSize: 14 }}
                        >
                          Select at least one permission before creating this
                          staff account.
                        </Typography>
                        {!selectedRegisterStaffType ? (
                          <Typography color={brand.textSoft}>
                            Select a role to configure staff permissions.
                          </Typography>
                        ) : selectedRegisterPermissionCards.length === 0 ? (
                          <Typography color={brand.textSoft}>
                            No cards found for the selected staff type.
                          </Typography>
                        ) : (
                          selectedRegisterPermissionCards.map((card) => (
                            <Box
                              key={card.name}
                              sx={{
                                mb: 2,
                                p: 2,
                                borderRadius: 2,
                                border: `1px solid ${brand.border}`,
                                backgroundColor: "#FFFFFF",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  mb: 1,
                                  color: brand.primaryDark,
                                }}
                              >
                                {card.label}
                              </Typography>
                              <Stack spacing={1.5}>
                                {getCardSections(card).map((section) => {
                                  const sectionKey = buildSectionKey(
                                    card.name,
                                    section.label,
                                  );
                                  const sectionFeatures =
                                    getSectionFeatures(section);
                                  const isSectionEnabled =
                                    registerExpandedPermissionSections[
                                      sectionKey
                                    ] || false;

                                  return (
                                    <Box
                                      key={sectionKey}
                                      sx={{
                                        border: `1px solid ${brand.border}`,
                                        borderRadius: 2,
                                        p: 1.5,
                                      }}
                                    >
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            checked={isSectionEnabled}
                                            onChange={(event) =>
                                              handleRegisterSectionEnabledChange(
                                                card,
                                                section,
                                                event.target.checked,
                                              )
                                            }
                                          />
                                        }
                                        label={
                                          <Box>
                                            <Typography
                                              sx={{
                                                fontWeight: 700,
                                                color: brand.text,
                                              }}
                                            >
                                              {section.label}
                                            </Typography>
                                            <Typography
                                              sx={{
                                                fontSize: 13,
                                                color: brand.textSoft,
                                              }}
                                            >
                                              Enable this section for the staff
                                              member.
                                            </Typography>
                                          </Box>
                                        }
                                        sx={{ alignItems: "flex-start", m: 0 }}
                                      />

                                      {isSectionEnabled && (
                                        <Stack spacing={1} sx={{ mt: 1 }}>
                                          {sectionFeatures.map((feature) => {
                                            const keyBase = buildPermissionKey(
                                              card.name,
                                              feature.label,
                                            );
                                            const permission =
                                              registerUserPermissions[keyBase] ||
                                              getDefaultPermissionRecord(
                                                card.name,
                                                feature,
                                                false,
                                                false,
                                              );

                                            return (
                                              <Box key={keyBase}>
                                                <FormControlLabel
                                                  control={
                                                    <Checkbox
                                                      checked={
                                                        permission.enabled
                                                      }
                                                      onChange={(event) =>
                                                        handleRegisterPermissionEnabledChange(
                                                          card.name,
                                                          feature,
                                                          keyBase,
                                                          event.target.checked,
                                                        )
                                                      }
                                                    />
                                                  }
                                                  label={feature.label}
                                                  sx={{ m: 0 }}
                                                />

                                                {permission.enabled && (
                                                  <Stack
                                                    direction="row"
                                                    flexWrap="wrap"
                                                    gap={1}
                                                    sx={{ ml: 4, mt: 0.5 }}
                                                  >
                                                    {Object.entries(
                                                      permission.actions,
                                                    ).map(
                                                      ([action, checked]) => (
                                                        <FormControlLabel
                                                          key={`${keyBase}_${action}`}
                                                          control={
                                                            <Checkbox
                                                              size="small"
                                                              checked={checked}
                                                              onChange={(
                                                                event,
                                                              ) =>
                                                                handleRegisterPermissionActionChange(
                                                                  card.name,
                                                                  feature,
                                                                  keyBase,
                                                                  action,
                                                                  event.target
                                                                    .checked,
                                                                )
                                                              }
                                                            />
                                                          }
                                                          label={
                                                            ACTION_LABELS[
                                                              action
                                                            ] || action
                                                          }
                                                          sx={{
                                                            mr: 0,
                                                            ml: 0,
                                                            color:
                                                              brand.textSoft,
                                                          }}
                                                        />
                                                      ),
                                                    )}
                                                  </Stack>
                                                )}
                                              </Box>
                                            );
                                          })}
                                        </Stack>
                                      )}
                                    </Box>
                                  );
                                })}
                              </Stack>
                            </Box>
                          ))
                        )}
                      </Box>
                    )}

                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={handleRegisterChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon
                              sx={{ color: brand.primaryDark }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              onClick={() => setShowPassword((prev) => !prev)}
                            >
                              {showPassword ? (
                                <VisibilityOffOutlinedIcon
                                  sx={{ color: brand.primaryDark }}
                                />
                              ) : (
                                <VisibilityOutlinedIcon
                                  sx={{ color: brand.primaryDark }}
                                />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={textFieldStyles}
                    />

                    <TextField
                      fullWidth
                      label="Confirm Password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleRegisterChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon
                              sx={{ color: brand.primaryDark }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              onClick={() =>
                                setShowConfirmPassword((prev) => !prev)
                              }
                            >
                              {showConfirmPassword ? (
                                <VisibilityOffOutlinedIcon
                                  sx={{ color: brand.primaryDark }}
                                />
                              ) : (
                                <VisibilityOutlinedIcon
                                  sx={{ color: brand.primaryDark }}
                                />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={textFieldStyles}
                    />
                  </Stack>
                </DialogContent>

                <DialogActions
                  sx={{
                    px: 3,
                    pb: 3,
                    pt: 1,
                    gap: 1,
                  }}
                >
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleCloseRegister}
                    sx={{
                      minWidth: 110,
                      borderRadius: 3,
                      px: 3,
                      py: 1.2,
                      textTransform: "none",
                      fontWeight: 700,
                      color: brand.text,
                      borderColor: brand.border,
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={savingRegister}
                    sx={{
                      minWidth: 140,
                      borderRadius: 3,
                      px: 3,
                      py: 1.2,
                      textTransform: "none",
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%)`,
                      boxShadow: "0 12px 24px rgba(16, 108, 107, 0.20)",
                      "&:hover": {
                        background: `linear-gradient(135deg, ${brand.primaryDark} 0%, ${brand.primaryDark} 100%)`,
                      },
                    }}
                  >
                    {savingRegister ? "Creating..." : "Create Account"}
                  </Button>
                </DialogActions>
              </Box>
            </Dialog>

            <Dialog
              open={openEditDialog}
              onClose={handleCloseEdit}
              fullWidth
              maxWidth="sm"
              disableRestoreFocus
              scroll="paper"
              PaperProps={{
                sx: {
                  borderRadius: 4,
                  border: `1px solid ${brand.border}`,
                  boxShadow: brand.shadowStrong,
                  overflow: "hidden",
                  width: "100%",
                  maxWidth: { xs: "calc(100% - 24px)", sm: "640px" },
                  height: { xs: "92vh", sm: "86vh" },
                  maxHeight: { xs: "92vh", sm: "86vh" },
                  display: "flex",
                  flexDirection: "column",
                },
              }}
            >
              <DialogTitle
                sx={{
                  fontWeight: 800,
                  color: brand.text,
                  pb: 1,
                }}
              >
                Update Staff
              </DialogTitle>

              <Box
                component="form"
                onSubmit={handleEditSubmit}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                <DialogContent
                  sx={{
                    pt: 1,
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    overflowX: "hidden",
                    ...hiddenScrollbarSx,
                  }}
                >
                  <Stack spacing={2}>
                    {editError ? (
                      <Alert severity="error" sx={{ borderRadius: 2 }}>
                        {editError}
                      </Alert>
                    ) : null}

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 2,
                      }}
                    >
                      <TextField
                        fullWidth
                        autoFocus
                        label="First Name"
                        name="firstName"
                        value={editFormData.firstName}
                        onChange={handleEditChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonOutlineIcon
                                sx={{ color: brand.primaryDark }}
                              />
                            </InputAdornment>
                          ),
                        }}
                        sx={textFieldStyles}
                      />

                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={editFormData.lastName}
                        onChange={handleEditChange}
                        sx={textFieldStyles}
                      />
                    </Box>

                    <TextField
                      fullWidth
                      label="Work Email"
                      name="email"
                      type="email"
                      value={editFormData.email}
                      onChange={handleEditChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MailOutlineIcon
                              sx={{ color: brand.primaryDark }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      sx={textFieldStyles}
                    />

                    <TextField
                      select
                      fullWidth
                      label="Roles"
                      name="roles"
                      value={editFormData.roles}
                      onChange={handleEditChange}
                      disabled={loadingRoles}
                      helperText={
                        loadingRoles ? "Loading roles..." : "Select a role"
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AdminPanelSettingsOutlinedIcon
                              sx={{ color: brand.primaryDark }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      sx={textFieldStyles}
                    >
                      <MenuItem value="">Select role</MenuItem>
                      {roleOptions.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      fullWidth
                      label={
                        editFormData.requestPending
                          ? "New Password (Required)"
                          : "New Password (Optional)"
                      }
                      name="password"
                      type={showEditPassword ? "text" : "password"}
                      value={editFormData.password}
                      onChange={handleEditChange}
                      placeholder="Enter new password"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon
                              sx={{ color: brand.primaryDark }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              onClick={() =>
                                setShowEditPassword((prev) => !prev)
                              }
                            >
                              {showEditPassword ? (
                                <VisibilityOffOutlinedIcon
                                  sx={{ color: brand.primaryDark }}
                                />
                              ) : (
                                <VisibilityOutlinedIcon
                                  sx={{ color: brand.primaryDark }}
                                />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={textFieldStyles}
                    />

                    {isSuperadmin && !isEditSuperadmin && (
                      <Box
                        sx={{
                          border: `1px solid ${brand.border}`,
                          borderRadius: 3,
                          p: 2,
                          backgroundColor: brand.soft,
                          mt: 1,
                        }}
                      >
                        <Typography
                          sx={{ fontWeight: 800, mb: 1, color: brand.text }}
                        >
                          Staff Permissions
                        </Typography>
                        {loadingPermissions ? (
                          <Typography color={brand.textSoft}>
                            Loading permissions...
                          </Typography>
                        ) : !selectedEditStaffType ? (
                          <Typography color={brand.textSoft}>
                            Select a role to configure card permissions.
                          </Typography>
                        ) : selectedPermissionCards.length === 0 ? (
                          <Typography color={brand.textSoft}>
                            No cards found for the selected staff type.
                          </Typography>
                        ) : (
                          selectedPermissionCards.map((card) => (
                            <Box
                              key={card.name}
                              sx={{
                                mb: 2,
                                p: 2,
                                borderRadius: 2,
                                border: `1px solid ${brand.border}`,
                                backgroundColor: "#FFFFFF",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  mb: 1,
                                  color: brand.primaryDark,
                                }}
                              >
                                {card.label}
                              </Typography>

                              {getCardSections(card).map((section) => {
                                const sectionKey = buildSectionKey(
                                  card.name,
                                  section.label,
                                );
                                const sectionFeatures =
                                  getSectionFeatures(section);
                                const isSectionEnabled = sectionFeatures.some(
                                  (feature) =>
                                    Boolean(
                                      userPermissions[
                                        buildPermissionKey(
                                          card.name,
                                          feature.label,
                                        )
                                      ]?.enabled,
                                    ),
                                );
                                const showSectionChildren =
                                  expandedPermissionSections[sectionKey] ||
                                  isSectionEnabled;

                                return (
                                  <Box
                                    key={sectionKey}
                                    sx={{
                                      mb: 1.25,
                                      p: 1.25,
                                      borderRadius: 2,
                                      border: `1px solid ${brand.border}`,
                                      backgroundColor: brand.softAlt,
                                    }}
                                  >
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          size="small"
                                          checked={isSectionEnabled}
                                          onChange={(event) =>
                                            handleSectionEnabledChange(
                                              card,
                                              section,
                                              event.target.checked,
                                            )
                                          }
                                        />
                                      }
                                      label={section.label}
                                      sx={{
                                        mb: showSectionChildren ? 1 : 0,
                                        width: "100%",
                                        color: brand.text,
                                      }}
                                    />

                                    {showSectionChildren && (
                                      <Stack spacing={1}>
                                        {section.children?.length > 0 ? (
                                          sectionFeatures.map((feature) => {
                                            const keyBase = buildPermissionKey(
                                              card.name,
                                              feature.label,
                                            );
                                            const permission =
                                              userPermissions[keyBase] ||
                                              getDefaultPermissionRecord(
                                                card.name,
                                                feature,
                                              );

                                            return (
                                              <Box
                                                key={feature.label}
                                                sx={{
                                                  p: 1,
                                                  borderRadius: 2,
                                                  border: `1px solid ${brand.border}`,
                                                  backgroundColor: "#FFFFFF",
                                                }}
                                              >
                                                <FormControlLabel
                                                  control={
                                                    <Checkbox
                                                      size="small"
                                                      checked={
                                                        permission.enabled
                                                      }
                                                      onChange={(event) =>
                                                        handlePermissionEnabledChange(
                                                          card.name,
                                                          feature,
                                                          keyBase,
                                                          event.target.checked,
                                                        )
                                                      }
                                                    />
                                                  }
                                                  label={feature.label}
                                                  sx={{
                                                    mb: permission.enabled
                                                      ? 1
                                                      : 0,
                                                    width: "100%",
                                                    color: brand.text,
                                                  }}
                                                />

                                                {permission.enabled && (
                                                  <Stack
                                                    direction="row"
                                                    flexWrap="wrap"
                                                    gap={1}
                                                  >
                                                    {Object.entries(
                                                      permission.actions,
                                                    ).map(
                                                      ([action, checked]) => (
                                                        <FormControlLabel
                                                          key={`${keyBase}_${action}`}
                                                          control={
                                                            <Checkbox
                                                              size="small"
                                                              checked={checked}
                                                              onChange={(
                                                                event,
                                                              ) =>
                                                                handlePermissionActionChange(
                                                                  card.name,
                                                                  feature,
                                                                  keyBase,
                                                                  action,
                                                                  event.target
                                                                    .checked,
                                                                )
                                                              }
                                                            />
                                                          }
                                                          label={
                                                            ACTION_LABELS[
                                                              action
                                                            ] || action
                                                          }
                                                          sx={{
                                                            mr: 0,
                                                            ml: 0,
                                                            color:
                                                              brand.textSoft,
                                                          }}
                                                        />
                                                      ),
                                                    )}
                                                  </Stack>
                                                )}
                                              </Box>
                                            );
                                          })
                                        ) : (
                                          (() => {
                                            const feature = sectionFeatures[0];
                                            const keyBase = buildPermissionKey(
                                              card.name,
                                              feature.label,
                                            );
                                            const permission =
                                              userPermissions[keyBase] ||
                                              getDefaultPermissionRecord(
                                                card.name,
                                                feature,
                                              );

                                            return permission.enabled ? (
                                              <Stack
                                                direction="row"
                                                flexWrap="wrap"
                                                gap={1}
                                              >
                                                {Object.entries(
                                                  permission.actions,
                                                ).map(([action, checked]) => (
                                                  <FormControlLabel
                                                    key={`${keyBase}_${action}`}
                                                    control={
                                                      <Checkbox
                                                        size="small"
                                                        checked={checked}
                                                        onChange={(event) =>
                                                          handlePermissionActionChange(
                                                            card.name,
                                                            feature,
                                                            keyBase,
                                                            action,
                                                            event.target
                                                              .checked,
                                                          )
                                                        }
                                                      />
                                                    }
                                                    label={
                                                      ACTION_LABELS[action] ||
                                                      action
                                                    }
                                                    sx={{
                                                      mr: 0,
                                                      ml: 0,
                                                      color: brand.textSoft,
                                                    }}
                                                  />
                                                ))}
                                              </Stack>
                                            ) : null;
                                          })()
                                        )}
                                      </Stack>
                                    )}
                                  </Box>
                                );
                              })}
                            </Box>
                          ))
                        )}
                      </Box>
                    )}

                    {!isSuperadmin && !isEditSuperadmin && (
                      <Alert
                        severity="info"
                        sx={{
                          mt: 1,
                          borderRadius: 3,
                        }}
                      >
                        Only Super Admin can configure card, sidebar, and action
                        permissions for a user.
                      </Alert>
                    )}
                  </Stack>
                </DialogContent>

                <DialogActions
                  sx={{
                    px: 3,
                    pb: 3,
                    pt: 1,
                    gap: 1,
                  }}
                >
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleCloseEdit}
                    sx={{
                      minWidth: 110,
                      borderRadius: 3,
                      px: 3,
                      py: 1.2,
                      textTransform: "none",
                      fontWeight: 700,
                      color: brand.text,
                      borderColor: brand.border,
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={savingEdit}
                    sx={{
                      minWidth: 140,
                      borderRadius: 3,
                      px: 3,
                      py: 1.2,
                      textTransform: "none",
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%)`,
                      boxShadow: "0 12px 24px rgba(16, 108, 107, 0.20)",
                      "&:hover": {
                        background: `linear-gradient(135deg, ${brand.primaryDark} 0%, ${brand.primaryDark} 100%)`,
                      },
                    }}
                  >
                    {savingEdit ? "Updating..." : "Update"}
                  </Button>
                </DialogActions>
              </Box>
            </Dialog>

            {error && (
              <Typography sx={{ color: brand.danger, mb: 2, fontWeight: 600 }}>
                {error}
              </Typography>
            )}

            <TableContainer
              sx={{
                borderRadius: 3,
                border: `1px solid ${brand.border}`,
                overflowX: "auto",
                overflowY: "hidden",
                backgroundColor: "#FFFFFF",
              }}
            >
              <Table
                sx={{
                  width: "100%",
                  minWidth: 980,
                  backgroundColor: "#FFFFFF",
                  tableLayout: "fixed",
                  borderCollapse: "collapse",
                }}
              >
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: brand.softAlt,
                    }}
                  >
                    <TableCell
                      sx={{
                        ...getCellSx(),
                        fontWeight: 800,
                        color: brand.text,
                        width: "20%",
                      }}
                    >
                      Name
                    </TableCell>

                    <TableCell
                      sx={{
                        ...getCellSx(),
                        fontWeight: 800,
                        color: brand.text,
                        width: "16%",
                      }}
                    >
                      Role
                    </TableCell>

                    <TableCell
                      sx={{
                        ...getCellSx(),
                        fontWeight: 800,
                        color: brand.text,
                        width: "18%",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Password Status
                    </TableCell>

                    <TableCell
                      sx={{
                        ...getCellSx(),
                        fontWeight: 800,
                        color: brand.text,
                        width: "18%",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Request Time
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        ...getCellSx({ align: "center" }),
                        fontWeight: 800,
                        color: brand.text,
                        width: "12%",
                      }}
                    >
                      Status
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        ...getCellSx({ isLast: true, align: "center" }),
                        fontWeight: 800,
                        color: brand.text,
                        width: "16%",
                      }}
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={getCellSx({ isLast: true, align: "center" })}
                      >
                        Loading staff...
                      </TableCell>
                    </TableRow>
                  ) : filteredRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={getCellSx({ isLast: true, align: "center" })}
                      >
                        No staff found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRows.map((row) => (
                      <TableRow
                        key={row._id}
                        hover
                        sx={{
                          backgroundColor: "#FFFFFF",
                          "&:hover": {
                            backgroundColor: "#FAFBFC",
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            ...getCellSx(),
                            color: brand.text,
                            fontWeight: 600,
                          }}
                        >
                          {row.name || "-"}
                        </TableCell>

                        <TableCell sx={getCellSx()}>
                          <Chip
                            label={row.roles || "-"}
                            size="small"
                            sx={{
                              borderRadius: 2,
                              backgroundColor: brand.soft,
                              color: brand.primaryDark,
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>

                        <TableCell sx={getCellSx()}>
                          <Chip
                            label={
                              row.passwordChangeRequest
                                ? "Request Pending"
                                : row.passwordChangeRequestMessage ||
                                  "No Request"
                            }
                            size="small"
                            sx={{
                              borderRadius: 2,
                              fontWeight: 700,
                              backgroundColor: row.passwordChangeRequest
                                ? "#FFF8ED"
                                : brand.soft,
                              color: row.passwordChangeRequest
                                ? "#D97706"
                                : brand.primaryDark,
                            }}
                          />
                        </TableCell>

                        <TableCell
                          sx={{
                            ...getCellSx(),
                            color: brand.textSoft,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.passwordChangeRequest
                            ? formatDateTime(row.passwordChangeRequestAt)
                            : "-"}
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={getCellSx({ align: "center" })}
                        >
                          <Chip
                            label={
                              row.isVerified === false ? "Pending" : "Active"
                            }
                            size="small"
                            sx={{
                              borderRadius: 2,
                              fontWeight: 700,
                              backgroundColor:
                                row.isVerified === false
                                  ? "#FFF8ED"
                                  : brand.soft,
                              color:
                                row.isVerified === false
                                  ? "#D97706"
                                  : brand.primaryDark,
                            }}
                          />
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={getCellSx({ isLast: true, align: "center" })}
                        >
                          <Stack
                            direction="row"
                            justifyContent="center"
                            spacing={1}
                          >
                            {row.passwordChangeRequest ? (
                              <IconButton
                                sx={actionButtonSx}
                                onClick={() =>
                                  handleCancelPasswordRequest(row._id)
                                }
                              >
                                <HighlightOffRoundedIcon
                                  sx={{
                                    fontSize: 18,
                                    color: brand.danger,
                                  }}
                                />
                              </IconButton>
                            ) : null}
                            <IconButton
                              sx={actionButtonSx}
                              onClick={() => handleOpenEdit(row)}
                            >
                              <EditRoundedIcon
                                sx={{
                                  fontSize: 18,
                                  color: brand.primaryDark,
                                }}
                              />
                            </IconButton>

                            <IconButton
                              onClick={() => handleDelete(row._id)}
                              sx={{
                                ...actionButtonSx,
                                "&:hover": {
                                  backgroundColor: brand.dangerSoft,
                                },
                              }}
                            >
                              <DeleteOutlineRoundedIcon
                                sx={{ fontSize: 18, color: brand.danger }}
                              />
                            </IconButton>

                            {row.isVerified === false && isSuperadmin ? (
                              <IconButton
                                sx={actionButtonSx}
                                onClick={() => handleVerify(row._id)}
                              >
                                <TaskAltRoundedIcon
                                  sx={{
                                    fontSize: 18,
                                    color: brand.primaryDark,
                                  }}
                                />
                              </IconButton>
                            ) : null}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default StaffPage;
