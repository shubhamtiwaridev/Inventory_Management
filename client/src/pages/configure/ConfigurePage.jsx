import { Box, Paper } from "@mui/material";
import { Outlet } from "react-router-dom";
import ModuleLayout from "../../components/ModuleLayout";
import { configureSidebarItems } from "../../components/sidebars/configureSidebarItems";

const ConfigurePage = () => {
  return (
    <ModuleLayout sidebarItems={configureSidebarItems} lockPageScroll>
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
            overflow: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Paper>
    </ModuleLayout>
  );
};

export default ConfigurePage;
