import { Paper, Stack, Typography } from "@mui/material";
import ModuleLayout from "../../components/ModuleLayout";

const brand = {
  primary: "#106C6B",
  border: "rgba(16, 108, 107, 0.24)",
  text: "#143736",
  textSoft: "#617776",
};

const softCardSx = {
  borderRadius: 4,
  border: `1px solid ${brand.border}`,
  backgroundColor: "#FFFFFF",
  boxShadow: "none",
};

const ModuleSectionPage = ({ title, sidebarItems, description }) => {
  return (
    <ModuleLayout sidebarItems={sidebarItems} lockPageScroll>
      <Stack
        spacing={0}
        sx={{
          height: "100%",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Paper elevation={0} sx={{ ...softCardSx, overflow: "hidden" }}>
          <Stack spacing={2} sx={{ p: { xs: 1.5, sm: 2 }, minHeight: 320 }}>
            <Typography
              sx={{
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
                fontWeight: 800,
                color: brand.text,
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                color: brand.textSoft,
                fontSize: "0.96rem",
                lineHeight: 1.7,
              }}
            >
              {description || `${title} page opened successfully.`}
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </ModuleLayout>
  );
};

export default ModuleSectionPage;
