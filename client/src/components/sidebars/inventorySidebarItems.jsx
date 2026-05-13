import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import MoveToInboxRoundedIcon from "@mui/icons-material/MoveToInboxRounded";
import OutboxRoundedIcon from "@mui/icons-material/OutboxRounded";
import WarehouseRoundedIcon from "@mui/icons-material/WarehouseRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import CloudDownloadRoundedIcon from "@mui/icons-material/CloudDownloadRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";

export const inventorySidebarItems = [
  {
    label: "Dashboard",
    icon: <DashboardRoundedIcon />,
    path: "/dashboard",
  },
  {
    label: "Inbound",
    icon: <MoveToInboxRoundedIcon />,
    path: "/inventory/inbound",
  },
  {
    label: "Outbound",
    icon: <OutboxRoundedIcon />,
    path: "/inventory/outbound",
  },
  {
    label: "Inventory",
    icon: <Inventory2RoundedIcon />,
    path: "/inventory",
  },
  {
    label: "Goods List",
    icon: <ViewListRoundedIcon />,
    path: "/inventory/goodslist/list",
    description: "Manage goods and goods masters.",
    children: [
      {
        label: "Goods List",
        icon: <ViewListRoundedIcon />,
        path: "/inventory/goodslist/list",
      },
    ],
  },
  {
    label: "Warehouses",
    icon: <WarehouseRoundedIcon />,
    path: "/inventory/warehouses",
  },
  {
    label: "Upload Center",
    icon: <CloudUploadRoundedIcon />,
    path: "/inventory/upload-center",
  },
  {
    label: "Download Center",
    icon: <CloudDownloadRoundedIcon />,
    path: "/inventory/download-center",
  },
];
