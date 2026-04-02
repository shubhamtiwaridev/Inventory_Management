import logo from "../assets/logo.png";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import WarehouseRoundedIcon from "@mui/icons-material/WarehouseRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

const brand = {
  primary: "#106C6B",
  primaryDark: "#0C5A58",
  primaryLight: "#17A89F",
  soft: "#E8F7F6",
  border: "rgba(16, 108, 107, 0.14)",
  text: "#143736",
  textSoft: "#617776",
};

const sidebarItems = [
  { label: "Dashboard", icon: <DashboardRoundedIcon />, path: "/dashboard" },
  { label: "Inventory", icon: <Inventory2RoundedIcon />, path: "/inventory" },
  {
    label: "Orders",
    icon: <ShoppingCartRoundedIcon />,
    badge: 24,
    path: "/orders",
  },
  {
    label: "Suppliers",
    icon: <LocalShippingRoundedIcon />,
    path: "/suppliers",
  },
  { label: "Warehouses", icon: <WarehouseRoundedIcon />, path: "/warehouses" },
  { label: "Categories", icon: <CategoryRoundedIcon />, path: "/categories" },
  { label: "Reports", icon: <BarChartRoundedIcon />, path: "/reports" },
  { label: "Team", icon: <Groups2RoundedIcon />, path: "/team" },
];

const getRoleLabel = (role) => {
  if (role === "superadmin") return "Superadmin";
  if (role === "admin") return "Admin";
  return "User";
};

const softCardSx = {
  borderRadius: 4,
  border: `1px solid ${brand.border}`,
  backgroundColor: "rgba(255,255,255,0.94)",
  boxShadow: "0 20px 50px rgba(16, 108, 107, 0.10)",
};

const SideBar = ({
  user,
  initials,
  canViewTeam,
  location,
  navigate,
  handleLogout,
}) => {
  const visibleSidebarItems = sidebarItems.filter((item) => {
    if (item.path === "/team" && !canViewTeam) return false;
    return true;
  });

  return (
    <Box
      sx={{
        width: { xs: "100%", md: 250 },
        borderRight: { md: `1px solid ${brand.border}` },
        borderBottom: { xs: `1px solid ${brand.border}`, md: "none" },
        backgroundColor: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(12px)",
        px: 2.5,
        py: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          mb: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          px: 0.5,
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="Decostyle"
          sx={{
            width: 170,
            height: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      </Box>

      <Typography
        variant="caption"
        sx={{
          color: brand.textSoft,
          fontWeight: 700,
          letterSpacing: 1,
          mb: 1.5,
          px: 1,
        }}
      >
        MAIN MENU
      </Typography>

      <Stack spacing={0.75}>
        {visibleSidebarItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Button
              key={item.label}
              startIcon={item.icon}
              fullWidth
              onClick={() => navigate(item.path)}
              sx={{
                justifyContent: "flex-start",
                borderRadius: 3,
                px: 1.5,
                py: 1.2,
                color: isActive ? brand.primary : brand.text,
                backgroundColor: isActive ? brand.soft : "transparent",
                fontWeight: isActive ? 700 : 600,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: isActive ? brand.soft : "#F4FAF9",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <span>{item.label}</span>
                {item.badge ? (
                  <Chip
                    label={item.badge}
                    size="small"
                    sx={{
                      height: 22,
                      borderRadius: 2,
                      backgroundColor: brand.primary,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.72rem",
                    }}
                  />
                ) : null}
              </Box>
            </Button>
          );
        })}
      </Stack>

      <Box sx={{ mt: "auto", pt: 4 }}>
        <Button
          startIcon={<SettingsRoundedIcon />}
          fullWidth
          sx={{
            justifyContent: "flex-start",
            borderRadius: 3,
            px: 1.5,
            py: 1.2,
            color: brand.text,
            fontWeight: 600,
            textTransform: "none",
            mb: 2,
            "&:hover": {
              backgroundColor: "#F4FAF9",
            },
          }}
        >
          Settings
        </Button>

        <Paper elevation={0} sx={{ ...softCardSx, p: 2.2, borderRadius: 4 }}>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Avatar
              sx={{
                bgcolor: brand.primary,
                width: 42,
                height: 42,
                fontWeight: 700,
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={700} sx={{ color: brand.text }} noWrap>
                {user?.name || "User"}
              </Typography>
              <Typography variant="body2" sx={{ color: brand.textSoft }} noWrap>
                {user?.email || "user@example.com"}
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={getRoleLabel(user?.role)}
            size="small"
            sx={{
              mb: 1.5,
              borderRadius: 2,
              backgroundColor: brand.soft,
              color: brand.primary,
              fontWeight: 700,
            }}
          />

          <Button
            fullWidth
            variant="outlined"
            startIcon={<LogoutRoundedIcon />}
            onClick={handleLogout}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
              color: brand.primary,
              borderColor: brand.border,
              "&:hover": {
                borderColor: brand.primaryLight,
                backgroundColor: brand.soft,
              },
            }}
          >
            Logout
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default SideBar;
