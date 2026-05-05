import { useMemo } from "react";
import { useAuth } from "../../store/AuthContext.jsx";
import { getVisibleSidebarItemsForUser } from "../../utils/permissions.js";
import { Box, Button, Paper, Stack } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ModuleLayout from "../../components/ModuleLayout";
import { machineMaintenanceSidebarItems } from "../../components/sidebars/machineMaintenanceSidebarItems";

const matchesPath = (pathname, targetPath) =>
  pathname === targetPath || pathname.startsWith(`${targetPath}/`);

const findCurrentParent = (pathname, sidebarItems = []) => {
  const childMatchedParent = sidebarItems.find((item) =>
    item.children?.some((child) => matchesPath(pathname, child.path)),
  );

  if (childMatchedParent) return childMatchedParent;

  return sidebarItems.find((item) => {
    if (item.path === "/dashboard") return false;
    return matchesPath(pathname, item.path);
  });
};

const tabButtonSx = (active) => ({
  borderRadius: 0,
  px: 2.25,
  py: 1.2,
  minWidth: 120,
  minHeight: 74,
  color: active ? "#111111" : "#444444",
  fontWeight: active ? 800 : 700,
  textTransform: "none",
  borderBottom: active ? "3px solid #111111" : "3px solid transparent",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 0.55,
  flexShrink: 0,
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
    textAlign: "center",
  },
  "&:hover": {
    backgroundColor: "transparent",
    color: "#111111",
  },
});

const hideScrollbarSx = {
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
};

const isConfigureRoute = (pathname) =>
  pathname.startsWith("/machine-maintenance/configure");

const MachineMaintenancePage = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const allowedSidebarItems = useMemo(
    () => getVisibleSidebarItemsForUser(machineMaintenanceSidebarItems, user),
    [user],
  );

  const currentParent = findCurrentParent(
    location.pathname,
    allowedSidebarItems,
  );
  const headerActions = isConfigureRoute(location.pathname)
    ? currentParent?.children || []
    : [];
  const content = children ?? <Outlet />;

  return (
    <ModuleLayout sidebarItems={allowedSidebarItems} lockPageScroll>
      <Stack
        spacing={0}
        sx={{
          height: "100%",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {headerActions.length > 0 && (
          <Box
            sx={{
              mb: 2,
              px: { xs: 1, sm: 2 },
              pt: 0.5,
              backgroundColor: "#FFFFFF",
              overflowX: "auto",
              overflowY: "hidden",
              flexShrink: 0,
              ...hideScrollbarSx,
            }}
          >
            <Stack
              direction="row"
              spacing={{ xs: 0.5, sm: 1.25 }}
              sx={{
                minWidth: "max-content",
                alignItems: "stretch",
              }}
            >
              {headerActions.map((action) => {
                const active = matchesPath(location.pathname, action.path);

                return (
                  <Button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    sx={tabButtonSx(active)}
                  >
                    <Box className="tab-icon">{action.icon}</Box>
                    <Box component="span" className="tab-label">
                      {action.label}
                    </Box>
                  </Button>
                );
              })}
            </Stack>
          </Box>
        )}

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            backgroundColor: "#FFFFFF",
            boxShadow: "none",
            minHeight: 320,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {content}
          </Box>
        </Paper>
      </Stack>
    </ModuleLayout>
  );
};

export default MachineMaintenancePage;
