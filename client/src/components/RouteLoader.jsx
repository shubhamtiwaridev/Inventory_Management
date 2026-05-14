import { Box } from "@mui/material";
import logo from "../assets/decostyle-logo.png";

const RouteLoader = ({ fullScreen = false }) => {
  return (
    <Box
      sx={{
        minHeight: fullScreen ? "100vh" : 180,
        width: "100%",
        display: "grid",
        placeItems: "center",
        px: 3,
        background: fullScreen
          ? "linear-gradient(180deg, #F8FAFC 0%, #F5F7FA 45%, #F2F5F8 100%)"
          : "transparent",
      }}
    >
      <Box
        component="img"
        src={logo}
        alt="Decostyle"
        sx={{
          width: fullScreen ? 180 : 132,
          maxWidth: "100%",
          height: "auto",
          display: "block",
          animation: "routeLoaderPulse 1.4s ease-in-out infinite",
          "@keyframes routeLoaderPulse": {
            "0%": {
              opacity: 0.7,
              transform: "scale(0.98)",
            },
            "50%": {
              opacity: 1,
              transform: "scale(1)",
            },
            "100%": {
              opacity: 0.7,
              transform: "scale(0.98)",
            },
          },
        }}
      />
    </Box>
  );
};

export default RouteLoader;
