import { Box, CircularProgress, Stack, Typography } from "@mui/material";

const FullPageLoader = ({
  title = "Loading",
  subtitle = "Please wait while the page is getting ready.",
}) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 3,
        background:
          "linear-gradient(180deg, #F8FAFC 0%, #F5F7FA 45%, #F2F5F8 100%)",
      }}
    >
      <Stack
        spacing={1.5}
        alignItems="center"
        sx={{
          width: "100%",
          maxWidth: 360,
          py: 4,
          px: 3,
          borderRadius: 4,
          backgroundColor: "#FFFFFF",
          boxShadow:
            "0 0 0 1px rgba(15, 23, 42, 0.04), 0 16px 40px rgba(15, 23, 42, 0.10)",
        }}
      >
        <CircularProgress size={34} sx={{ color: "#106C6B" }} />

        <Typography
          variant="h6"
          sx={{ fontWeight: 800, color: "#143736", textAlign: "center" }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: "#617776", textAlign: "center" }}
        >
          {subtitle}
        </Typography>
      </Stack>
    </Box>
  );
};

export default FullPageLoader;
