import logo from "../assets/decostyle-logo.png";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";

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

const SideBar = ({ canViewTeam, location, navigate, sidebarItems = [] }) => {
  const visibleSidebarItems = sidebarItems.filter((item) => {
    if (item.path === "/team" && !canViewTeam) return false;
    return true;
  });

  return (
    <Box
      sx={{
        width: { xs: "100%", md: 228 },
        borderRight: { md: `1px solid ${brand.border}` },
        borderBottom: { xs: `1px solid ${brand.border}`, md: "none" },
        backgroundColor: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(12px)",
        px: 2,
        py: 2.5,
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
          const { isActive } = getSidebarItemState(item, location.pathname);

          return (
            <Button
              key={item.label}
              startIcon={item.icon}
              fullWidth
              disableRipple
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
    </Box>
  );
};

export default SideBar;
