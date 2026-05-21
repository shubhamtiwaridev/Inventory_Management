import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import LocalMallRoundedIcon from "@mui/icons-material/LocalMallRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

export const ecomSidebarItems = [
  { label: "Dashboard", icon: <DashboardRoundedIcon />, path: "/dashboard" },
  {
    label: "Ecom Products",
    icon: <ShoppingCartRoundedIcon />,
    path: "/ecom",
    description: "E-commerce channels overview",
  },
  {
    label: "Amazon",
    icon: <LocalShippingRoundedIcon />,
    path: "/ecom/amazon",
  },
  {
    label: "Flipkart",
    icon: <StorefrontRoundedIcon />,
    path: "/ecom/flipkart",
  },
  { label: "Meesho", icon: <LocalMallRoundedIcon />, path: "/ecom/messho" },
  {
    label: "Upload Center",
    icon: <CloudUploadRoundedIcon />,
    path: "/ecom/upload-center",
  },
  {
    label: "Download Center",
    icon: <DownloadRoundedIcon />,
    path: "/ecom/download-center",
  },
];
