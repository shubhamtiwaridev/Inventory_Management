import { Box } from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext.jsx";
import SideBar from "../pages/mainpages/SideBar.jsx";

const brand = {
  pageBg: "#FFFFFF",
};

const ModuleLayout = ({
  sidebarItems = [],
  children,
  lockPageScroll = false,
}) => {
  const { canViewTeam } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        height: lockPageScroll ? "100dvh" : "auto",
        background: brand.pageBg,
        overflow: lockPageScroll ? "hidden" : "visible",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "flex",
          minHeight: "100dvh",
          height: lockPageScroll ? "100dvh" : "auto",
          flexDirection: { xs: "column", md: "row" },
          overflow: lockPageScroll ? "hidden" : "visible",
          boxSizing: "border-box",
        }}
      >
        <SideBar
          canViewTeam={canViewTeam}
          location={location}
          navigate={navigate}
          sidebarItems={sidebarItems}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
            backgroundColor: "#FFFFFF",
            overflow: lockPageScroll ? "hidden" : "visible",
            height: lockPageScroll ? "100%" : "auto",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default ModuleLayout;
