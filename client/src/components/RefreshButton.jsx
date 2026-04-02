import { Button, CircularProgress } from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

const RefreshButton = ({
  onClick,
  loading = false,
  disabled = false,
  children = "REFRESH",
  sx = {},
}) => {
  return (
    <Button
      startIcon={
        loading ? (
          <CircularProgress size={16} sx={{ color: "inherit" }} />
        ) : (
          <RefreshRoundedIcon />
        )
      }
      onClick={onClick}
      disabled={loading || disabled}
      sx={{
        minWidth: 120,
        borderRadius: 2.5,
        color: "#106C6B",
        backgroundColor: "#fff",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        textTransform: "none",
        fontWeight: 700,
        px: 2,
        boxShadow:
          "0 0 0 1px rgba(15, 23, 42, 0.03), 0 12px 30px rgba(15, 23, 42, 0.08)",
        "&:hover": {
          backgroundColor: "#F7F9FB",
        },
        ...sx,
      }}
    >
      {loading ? "REFRESHING..." : children}
    </Button>
  );
};

export default RefreshButton;