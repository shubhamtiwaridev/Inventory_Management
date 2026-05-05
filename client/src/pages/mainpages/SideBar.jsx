import logo from "../../assets/decostyle-logo.png";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useAuth } from "../../store/AuthContext.jsx";
import { getVisibleSidebarItemsForUser } from "../../utils/permissions.js";

const brand = {
  primary: "#106C6B",
  primaryDark: "#0C5A58",
  primaryLight: "#17A89F",
  soft: "#E8F7F6",
  border: "rgba(16, 108, 107, 0.14)",
  text: "#143736",
  textSoft: "#617776",
};

const matchesPath = (pathname, targetPath) => {
  if (!targetPath) return false;
  return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
};

const getSidebarItemState = (item, pathname) => {
  const itemPath = item.path || "";
  const children = Array.isArray(item.children) ? item.children : [];

  const isDirectMatch = matchesPath(pathname, itemPath);
  const isChildMatch = children.some((child) =>
    matchesPath(pathname, child.path),
  );

  return {
    isActive: isDirectMatch || isChildMatch,
  };
};

const SideBar = ({
  canViewTeam,
  location,
  navigate,
  sidebarItems = [],
  collapsed = false,
  onToggleCollapse,
}) => {
  const { user } = useAuth();
  const rawSidebarItems = sidebarItems.filter(
    (item) => !(item.path === "/team" && !canViewTeam),
  );

  const visibleSidebarItems = getVisibleSidebarItemsForUser(
    rawSidebarItems,
    user,
  );
  return (
    <Box
      sx={{
        width: { xs: "100%", md: collapsed ? 45 : 228 },
        flexShrink: 0,
        height: { xs: "auto", md: "100vh" },
        position: { xs: "relative", md: "sticky" },
        top: { xs: "auto", md: 0 },
        alignSelf: { xs: "stretch", md: "flex-start" },
        overflowY: { xs: "visible", md: "auto" },
        overflowX: "hidden",
        borderRight: { md: `1px solid ${brand.border}` },
        borderBottom: { xs: `1px solid ${brand.border}`, md: "none" },
        backgroundColor: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(12px)",
        px: collapsed ? 1.25 : 2,
        py: 2.5,
        display: "flex",
        flexDirection: "column",
        transition: "width 180ms ease, padding 180ms ease",
      }}
    >
      <Box
        sx={{
          mb: collapsed ? 2.5 : 4,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          px: 0.5,
          flexShrink: 0,
          gap: 1,
        }}
      >
        {!collapsed ? (
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
        ) : null}

        <IconButton
          onClick={onToggleCollapse}
          size="small"
          sx={{
            width: 34,
            height: 34,
            border: `1px solid ${brand.border}`,
            color: brand.text,
            backgroundColor: "#FFFFFF",
            "&:hover": {
              backgroundColor: brand.soft,
            },
          }}
        >
          {collapsed ? (
            <ChevronRightRoundedIcon fontSize="small" />
          ) : (
            <ChevronLeftRoundedIcon fontSize="small" />
          )}
        </IconButton>
      </Box>

      {!collapsed ? (
        <Typography
          variant="caption"
          sx={{
            color: brand.textSoft,
            fontWeight: 700,
            letterSpacing: 1,
            mb: 1.5,
            px: 1,
            flexShrink: 0,
          }}
        >
          MAIN MENU
        </Typography>
      ) : null}

      <Stack spacing={0.75} sx={{ pb: 1 }}>
        {visibleSidebarItems.map((item) => {
          const { isActive } = getSidebarItemState(item, location.pathname);

          return (
            <Button
              key={item.label}
              startIcon={item.icon}
              fullWidth
              disableRipple
              onClick={() => navigate(item.path)}
              sx={{
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 3,
                minWidth: 0,
                px: collapsed ? 1 : 1.5,
                py: 1.2,
                color: isActive ? brand.primary : brand.text,
                backgroundColor: isActive ? brand.soft : "transparent",
                fontWeight: isActive ? 700 : 600,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: isActive ? brand.soft : "#F4FAF9",
                  color: isActive ? brand.primary : brand.text,
                  boxShadow: "none",
                },
                "&:focus": {
                  outline: "none",
                  backgroundColor: isActive ? brand.soft : "transparent",
                },
                "&.Mui-focusVisible": {
                  outline: "none",
                  backgroundColor: isActive ? brand.soft : "transparent",
                  boxShadow: "none",
                },
                "&:active": {
                  backgroundColor: isActive ? brand.soft : "#F4FAF9",
                  boxShadow: "none",
                },
                "& .MuiButton-startIcon": {
                  color: isActive ? brand.primary : brand.text,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  justifyContent: collapsed ? "center" : "space-between",
                }}
              >
                {!collapsed ? <span>{item.label}</span> : null}

                {!collapsed && item.badge ? (
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
    </Box>
  );
};

export default SideBar;
