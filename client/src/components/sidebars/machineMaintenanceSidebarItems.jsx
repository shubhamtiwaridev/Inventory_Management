import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PrecisionManufacturingRoundedIcon from "@mui/icons-material/PrecisionManufacturingRounded";
import HandymanRoundedIcon from "@mui/icons-material/HandymanRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import EngineeringRoundedIcon from "@mui/icons-material/EngineeringRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import AppRegistrationRoundedIcon from "@mui/icons-material/AppRegistrationRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import PlaylistAddCheckRoundedIcon from "@mui/icons-material/PlaylistAddCheckRounded";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import GppGoodRoundedIcon from "@mui/icons-material/GppGoodRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import FactoryRoundedIcon from "@mui/icons-material/FactoryRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import StraightenRoundedIcon from "@mui/icons-material/StraightenRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import RepeatRoundedIcon from "@mui/icons-material/RepeatRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";

export const machineMaintenanceSidebarItems = [
  {
    label: "Dashboard",
    icon: <DashboardRoundedIcon />,
    path: "/dashboard",
  },
  {
    label: "Asset Management",
    icon: <PrecisionManufacturingRoundedIcon />,
    path: "/machine-maintenance/assets/list",
    description: "Manage machines and asset records.",
    children: [
      {
        label: "List of Assets",
        icon: <ViewListRoundedIcon />,
        path: "/machine-maintenance/assets/list",
        description: "View all registered machines and assets.",
      },
      {
        label: "Machine Registration",
        icon: <AppRegistrationRoundedIcon />,
        path: "/machine-maintenance/assets/register",
        description: "Register a new machine or asset.",
      },
    ],
  },
  {
    label: "Spare Master",
    icon: <HandymanRoundedIcon />,
    path: "/machine-maintenance/spare-master/list",
    description: "Manage spare items and spare registration.",
    children: [
      {
        label: "List of Spares",
        icon: <ViewListRoundedIcon />,
        path: "/machine-maintenance/spare-master/list",
        description: "View all spare records.",
      },
      {
        label: "Spare Registration",
        icon: <AppRegistrationRoundedIcon />,
        path: "/machine-maintenance/spare-master/register",
        description: "Register a new spare item.",
      },
    ],
  },
  {
    label: "Task Master",
    icon: <TaskAltRoundedIcon />,
    path: "/machine-maintenance/tasks/list",
    description: "Manage maintenance tasks and schedules.",
    children: [
      {
        label: "List of Tasks",
        icon: <PlaylistAddCheckRoundedIcon />,
        path: "/machine-maintenance/tasks/list",
        description: "View all maintenance tasks.",
      },
      {
        label: "Schedule",
        icon: <CalendarMonthRoundedIcon />,
        path: "/machine-maintenance/tasks/schedule",
        description: "Manage task schedules.",
      },
    ],
  },
  {
    label: "User Allocation",
    icon: <EngineeringRoundedIcon />,
    path: "/machine-maintenance/user-allocation/list",
    description: "Manage users and machine allocation.",
    children: [
      {
        label: "List of Users",
        icon: <GroupRoundedIcon />,
        path: "/machine-maintenance/user-allocation/list",
        description: "View all assigned users.",
      },
      {
        label: "Allocation",
        icon: <AssignmentIndRoundedIcon />,
        path: "/machine-maintenance/user-allocation/allocation",
        description: "Allocate users to machines or tasks.",
      },
    ],
  },
  {
    label: "Vendor/Supplier",
    icon: <LocalShippingRoundedIcon />,
    path: "/machine-maintenance/vendors/list",
    description: "Manage vendors and supplier records.",
    children: [
      {
        label: "List of Vendors",
        icon: <ViewListRoundedIcon />,
        path: "/machine-maintenance/vendors/list",
        description: "View all vendors and suppliers.",
      },
      {
        label: "Vendor Registration",
        icon: <AppRegistrationRoundedIcon />,
        path: "/machine-maintenance/vendors/register",
        description: "Register a new vendor or supplier.",
      },
    ],
  },
  {
    label: "Breakdown/Consume",
    icon: <WarningAmberRoundedIcon />,
    path: "/machine-maintenance/consume/breakdown-list",
    description: "Manage breakdown and consume records.",
    children: [
      {
        label: "Breakdown List",
        icon: <ReportProblemRoundedIcon />,
        path: "/machine-maintenance/consume/breakdown-list",
        description: "View all breakdown records.",
      },
      {
        label: "Consume Entry",
        icon: <RemoveCircleOutlineRoundedIcon />,
        path: "/machine-maintenance/consume/entry",
        description: "Manage consume entries.",
      },
    ],
  },
  {
    label: "Complient",
    icon: <GppGoodRoundedIcon />,
    path: "/machine-maintenance/complient/assets",
    description: "Manage complient records.",
    children: [
      {
        label: "Assets",
        icon: <PrecisionManufacturingRoundedIcon />,
        path: "/machine-maintenance/complient/assets",
        description: "Manage asset complient records.",
      },
      {
        label: "Spare",
        icon: <HandymanRoundedIcon />,
        path: "/machine-maintenance/complient/spare",
        description: "Manage spare complient records.",
      },
      {
        label: "Task Master",
        icon: <TaskAltRoundedIcon />,
        path: "/machine-maintenance/complient/task-master",
        description: "Manage task master complient records.",
      },
      {
        label: "Vendor/Supplier",
        icon: <LocalShippingRoundedIcon />,
        path: "/machine-maintenance/complient/vendor-supplier",
        description: "Manage vendor complient records.",
      },
    ],
  },
  {
    label: "Configure",
    icon: <SettingsRoundedIcon />,
    path: "/machine-maintenance/configure/department",
    description: "Manage configure master records.",
    children: [
      {
        label: "Department",
        icon: <ApartmentRoundedIcon />,
        path: "/machine-maintenance/configure/department",
        description: "Manage department master records.",
      },
      {
        label: "Shift Timing",
        icon: <AccessTimeRoundedIcon />,
        path: "/machine-maintenance/configure/shift-timing",
        description: "Manage shift timing master records.",
      },
      {
        label: "Plant Site",
        icon: <FactoryRoundedIcon />,
        path: "/machine-maintenance/configure/plant-site",
        description: "Manage plant and site master records.",
      },
      {
        label: "Status",
        icon: <ToggleOnRoundedIcon />,
        path: "/machine-maintenance/configure/status",
        description: "Manage status master records.",
      },
      {
        label: "Critical Level",
        icon: <WarningAmberRoundedIcon />,
        path: "/machine-maintenance/configure/critical-level",
        description: "Manage critical level master records.",
      },
      {
        label: "Units of Measure",
        icon: <StraightenRoundedIcon />,
        path: "/machine-maintenance/configure/unit-of-measure",
        description: "Manage units of measure master records.",
      },
      {
        label: "Task Category",
        icon: <CategoryRoundedIcon />,
        path: "/machine-maintenance/configure/task-category",
        description: "Manage task category master records.",
      },
      {
        label: "Frequency",
        icon: <RepeatRoundedIcon />,
        path: "/machine-maintenance/configure/frequency",
        description: "Manage frequency master records.",
      },
      {
        label: "Contract Type",
        icon: <AssignmentRoundedIcon />,
        path: "/machine-maintenance/configure/contract-type",
        description: "Manage contract type master records.",
      },
    ],
  },
];
