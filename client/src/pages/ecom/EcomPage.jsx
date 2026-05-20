import { Box, Button, Paper, Stack } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import ModuleLayout from "../../components/ModuleLayout";
import { ecomSidebarItems } from "../../components/sidebars/ecomSidebarItems.jsx";
import { useMemo } from "react";
import {
  useAppNavigate,
  preloadRouteModules,
} from "../../hooks/useAppNavigate.jsx";
import { useAuth } from "../../store/AuthContext.jsx";
import { getVisibleSidebarItemsForUser } from "../../utils/permissions.js";

const EcomPage = ({ children }) => {
  const { user } = useAuth();

  const allowedSidebarItems = useMemo(
    () => getVisibleSidebarItemsForUser(ecomSidebarItems, user),
    [user],
  );

  const location = useLocation();
  const navigate = useAppNavigate();

  const matchesPath = (pathname, targetPath) =>
    pathname === targetPath || pathname.startsWith(`${targetPath}/`);

  const findCurrentParent = (pathname, sidebarItems = []) => {
    const childMatchedParent = sidebarItems.find((item) =>
      (item.children || []).some((child) => matchesPath(pathname, child.path)),
    );

    if (childMatchedParent) return childMatchedParent;

    return (
      sidebarItems.find((item) => {
        if (item.path === "/dashboard") return false;
        return matchesPath(pathname, item.path);
      }) || sidebarItems[1]
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

  const content = children ?? <Outlet />;
  const shouldLockPageScroll = true;

  const currentParent = findCurrentParent(
    location.pathname,
    allowedSidebarItems,
  );
  const headerActions = currentParent?.children || [];

  return (
    <ModuleLayout
      sidebarItems={allowedSidebarItems}
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
                alignItems: "flex-end",
              }}
            >
              {headerActions.map((action) => {
                const active = matchesPath(location.pathname, action.path);

                return (
                  <Button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    onMouseEnter={() => preloadRouteModules(action.path)}
                    onFocus={() => preloadRouteModules(action.path)}
                    onTouchStart={() => preloadRouteModules(action.path)}
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

export default EcomPage;
