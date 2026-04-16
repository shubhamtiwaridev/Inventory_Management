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
];
