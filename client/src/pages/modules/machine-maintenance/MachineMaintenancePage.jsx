import { Box, Button, Paper, Stack } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ModuleLayout from "../../../components/layouts/ModuleLayout";
import { machineMaintenanceSidebarItems } from "../../../components/sidebars/machineMaintenanceSidebarItems";
import { MachineMaintenanceDataProvider } from "./components/MachineMaintenanceDataContext.jsx";

const brand = {
  border: "rgba(16, 108, 107, 0.24)",
};

const matchesPath = (pathname, targetPath) =>
  pathname === targetPath || pathname.startsWith(`${targetPath}/`);

const findCurrentParent = (pathname) => {
  return (
    machineMaintenanceSidebarItems.find((item) => {
      if (item.path === "/dashboard") return false;
      if (matchesPath(pathname, item.path)) return true;
      return item.children?.some((child) => matchesPath(pathname, child.path));
    }) || machineMaintenanceSidebarItems[1]
  );
};

const tabButtonSx = (active) => ({
  borderRadius: 0,
  px: 2.25,
  py: 1.4,
  minWidth: 120,
  color: active ? "#111111" : "#444444",
  fontWeight: active ? 800 : 700,
  textTransform: "none",
  borderBottom: active ? "3px solid #111111" : "3px solid transparent",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 0.55,
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

const MachineMaintenancePage = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentParent = findCurrentParent(location.pathname);
  const headerActions = currentParent.children || [];
  const content = children ?? <Outlet />;

  return (
    <MachineMaintenanceDataProvider>
      <ModuleLayout sidebarItems={machineMaintenanceSidebarItems}>
        <Stack spacing={0}>
          {headerActions.length > 0 && (
            <Box
              sx={{
                mb: 2,
                px: { xs: 1, sm: 2 },
                pt: 1,
                backgroundColor: "#FFFFFF",
                borderBottom: "none",
                overflowX: "auto",
              }}
            >
              <Stack
                direction="row"
                spacing={{ xs: 0.5, sm: 1.25 }}
                sx={{
                  minWidth: "max-content",
                  alignItems: "flex-end",
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
              border: `1px solid ${brand.border}`,
              backgroundColor: "#FFFFFF",
              boxShadow: "none",
              overflow: "hidden",
              minHeight: 320,
            }}
          >
            <Box sx={{ p: { xs: 1.5, sm: 2 } }}>{content}</Box>
          </Paper>
        </Stack>
      </ModuleLayout>
    </MachineMaintenanceDataProvider>
  );
};

export default MachineMaintenancePage;
