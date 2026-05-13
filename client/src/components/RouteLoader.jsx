import { Box, CircularProgress } from "@mui/material";

const RouteLoader = ({ fullScreen = false }) => {
  return (
    <Box
      sx={{
        minHeight: fullScreen ? "100vh" : 180,
        width: "100%",
        display: "grid",
        placeItems: "center",
      }}
    >
      <CircularProgress size={fullScreen ? 30 : 24} sx={{ color: "#106C6B" }} />
    </Box>
  );
};

export default RouteLoader;
