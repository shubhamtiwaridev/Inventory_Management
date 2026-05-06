import { Paper, Stack, Typography } from "@mui/material";
import ModuleLayout from "../../components/ModuleLayout";
import { sparesSidebarItems } from "../../components/sidebars/sparesSidebarItems";

const brand = {
  border: "rgba(15, 23, 42, 0.08)",
  text: "#143736",
  textSoft: "#617776",
  shadow:
    "0 0 0 1px rgba(15, 23, 42, 0.03), 0 12px 30px rgba(15, 23, 42, 0.08)",
};

const softCardSx = {
  borderRadius: 4,
  border: `1px solid ${brand.border}`,
  backgroundColor: "#FFFFFF",
  boxShadow: brand.shadow,
};

const SparesPage = () => {
  return (
    <ModuleLayout sidebarItems={sparesSidebarItems} lockPageScroll>
      <Stack
        spacing={3}
        sx={{
          height: "100%",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, color: brand.text }}>
          Spares
        </Typography>

        <Paper
          elevation={0}
          sx={{
            ...softCardSx,
            p: 3,
            overflow: "hidden",
          }}
        >
          <Typography sx={{ fontWeight: 700, color: brand.text, mb: 1 }}>
            Spares Overview
          </Typography>
          <Typography sx={{ color: brand.textSoft }}>
            This spares module opens with its own sidebar.
          </Typography>
        </Paper>
      </Stack>
    </ModuleLayout>
  );
};

export default SparesPage;
