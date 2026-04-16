import { Paper, Stack, Typography } from "@mui/material";
import ModuleLayout from "../../components/layouts/ModuleLayout";

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

const ModuleSectionPage = ({ title, sidebarItems, description }) => {
  return (
    <ModuleLayout sidebarItems={sidebarItems}>
      <Stack spacing={3}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: brand.text }}>
          {title}
        </Typography>

        <Paper elevation={0} sx={{ ...softCardSx, p: 3 }}>
          <Typography sx={{ fontWeight: 700, color: brand.text, mb: 1 }}>
            {title}
          </Typography>
          <Typography sx={{ color: brand.textSoft }}>
            {description || `${title} page opened successfully.`}
          </Typography>
        </Paper>
      </Stack>
    </ModuleLayout>
  );
};

export default ModuleSectionPage;
