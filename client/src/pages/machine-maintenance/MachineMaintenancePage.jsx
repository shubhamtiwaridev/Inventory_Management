import { Box, Paper } from "@mui/material";
import { Outlet } from "react-router-dom";
import ModuleLayout from "../../components/ModuleLayout";
import { machineMaintenanceSidebarItems } from "../../components/sidebars/machineMaintenanceSidebarItems";

const MachineMaintenancePage = ({ children }) => {
  const content = children ?? <Outlet />;

  return (
    <ModuleLayout sidebarItems={machineMaintenanceSidebarItems} lockPageScroll>
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
    </ModuleLayout>
  );
};

export default MachineMaintenancePage;
