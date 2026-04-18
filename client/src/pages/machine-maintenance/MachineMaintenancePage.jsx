import { Box, Button, Paper, Stack } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ModuleLayout from "../../components/ModuleLayout";
import { machineMaintenanceSidebarItems } from "../../components/sidebars/machineMaintenanceSidebarItems";

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

const lockedRoutePrefixes = [
  "/machine-maintenance/assets/",
  "/machine-maintenance/spare-master/",
  "/machine-maintenance/tasks/",
  "/machine-maintenance/user-allocation/",
  "/machine-maintenance/vendors/",
  "/machine-maintenance/consume/",
];

const MachineMaintenancePage = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentParent = findCurrentParent(location.pathname);
  const headerActions = currentParent.children || [];
  const content = children ?? <Outlet />;

  const shouldLockPageScroll = lockedRoutePrefixes.some((prefix) =>
    location.pathname.startsWith(prefix),
  );

  return (
    <ModuleLayout
      sidebarItems={machineMaintenanceSidebarItems}
      lockPageScroll={shouldLockPageScroll}
    >
      <Stack
        spacing={0}
        sx={
          shouldLockPageScroll
            ? {
                height: "100%",
                minHeight: 0,
                overflow: "hidden",
              }
            : undefined
        }
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
            overflow: shouldLockPageScroll ? "hidden" : "visible",
            ...(shouldLockPageScroll
              ? {
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                }
              : {}),
          }}
        >
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              overflow: shouldLockPageScroll ? "hidden" : "visible",
              ...(shouldLockPageScroll
                ? {
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                  }
                : {}),
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
