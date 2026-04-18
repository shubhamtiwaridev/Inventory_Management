import { Paper, Stack, Typography } from "@mui/material";
import ModuleLayout from "../../components/ModuleLayout";
import { inventorySidebarItems } from "../../components/sidebars/inventorySidebarItems";

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

const InventoryPage = () => {
  return (
    <ModuleLayout sidebarItems={inventorySidebarItems}>
      <Stack spacing={3}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: brand.text }}>
          Inventory
        </Typography>

        <Paper elevation={0} sx={{ ...softCardSx, p: 3 }}>
          <Typography sx={{ fontWeight: 700, color: brand.text, mb: 1 }}>
            Inventory Overview
          </Typography>
          <Typography sx={{ color: brand.textSoft }}>
            This inventory module opens with its own sidebar.
          </Typography>
        </Paper>
      </Stack>
    </ModuleLayout>
  );
};

export default InventoryPage;
