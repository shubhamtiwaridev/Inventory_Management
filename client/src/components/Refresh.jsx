import Button from "@mui/material/Button";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

const RefreshButton = ({ onClick, brand, sx = {}, children = "Refresh" }) => {
  return (
    <Button
      variant="outlined"
      startIcon={<RefreshRoundedIcon />}
      onClick={onClick}
      sx={{
        borderRadius: 3,
        px: 2,
        py: 1.15,
        textTransform: "none",
        fontWeight: 700,
        color: brand.text,
        borderColor: brand.border,
        "&:hover": {
          borderColor: brand.primaryLight,
          backgroundColor: brand.soft,
        },
        ...sx,
      }}
    >
      {children}
    </Button>
  );
};

export default RefreshButton;