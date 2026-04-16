import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import HandymanRoundedIcon from "@mui/icons-material/HandymanRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";

export const sparesSidebarItems = [
  { label: "Dashboard", icon: <DashboardRoundedIcon />, path: "/dashboard" },
  {
    label: "Spares Overview",
    icon: <BuildRoundedIcon />,
    path: "/spares",
  },
  {
    label: "Spare Items",
    icon: <HandymanRoundedIcon />,
    path: "/spares/items",
  },
  {
    label: "Storage",
    icon: <StorageRoundedIcon />,
    path: "/spares/storage",
  },
  {
    label: "Issue Spares",
    icon: <SettingsSuggestRoundedIcon />,
    path: "/spares/issue",
  },
  {
    label: "Re Orders",
    icon: <AutorenewRoundedIcon />,
    path: "/spares/re-orders",
  },
  {
    label: "Suppliers",
    icon: <LocalShippingRoundedIcon />,
    path: "/spares/suppliers",
  },
];
