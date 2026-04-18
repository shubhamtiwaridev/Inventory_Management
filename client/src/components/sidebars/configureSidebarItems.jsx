import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import FactoryRoundedIcon from "@mui/icons-material/FactoryRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import StraightenRoundedIcon from "@mui/icons-material/StraightenRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import RepeatRoundedIcon from "@mui/icons-material/RepeatRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";

export const configureSidebarItems = [
  {
    label: "Dashboard",
    icon: <DashboardRoundedIcon />,
    path: "/dashboard",
  },
  {
    label: "Department",
    icon: <ApartmentRoundedIcon />,
    path: "/configure/department",
    description: "Manage department master records.",
  },
  {
    label: "Shift Timing",
    icon: <AccessTimeRoundedIcon />,
    path: "/configure/shift-timing",
    description: "Manage shift timing master records.",
  },
  {
    label: "Plant Site",
    icon: <FactoryRoundedIcon />,
    path: "/configure/plant-site",
    description: "Manage plant and site master records.",
  },
  {
    label: "Status",
    icon: <ToggleOnRoundedIcon />,
    path: "/configure/status",
    description: "Manage status master records.",
  },
  {
    label: "Critical Level",
    icon: <WarningAmberRoundedIcon />,
    path: "/configure/critical-level",
    description: "Manage critical level master records.",
  },
  {
    label: "Units of Measure",
    icon: <StraightenRoundedIcon />,
    path: "/configure/unit-of-measure",
    description: "Manage units of measure master records.",
  },
  {
    label: "Task Category",
    icon: <CategoryRoundedIcon />,
    path: "/configure/task-category",
    description: "Manage task category master records.",
  },
  {
    label: "Frequency",
    icon: <RepeatRoundedIcon />,
    path: "/configure/frequency",
    description: "Manage frequency master records.",
  },
  {
    label: "Contract Type",
    icon: <AssignmentRoundedIcon />,
    path: "/configure/contract-type",
    description: "Manage contract type master records.",
  },
];
