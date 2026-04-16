import { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

const brand = {
  primary: "#106C6B",
  border: "rgba(15, 23, 42, 0.08)",
  text: "#143736",
  textSoft: "#617776",
  shadow:
    "0 0 0 1px rgba(15, 23, 42, 0.03), 0 12px 30px rgba(15, 23, 42, 0.08)",
};

const getRoleLabel = (user) => {
  const rawRole = String(user?.roles || user?.role || "user").toLowerCase();

  if (rawRole === "superadmin") return "Superadmin";
  if (rawRole === "admin") return "Admin";
  if (rawRole === "user") return "User";

  return rawRole.charAt(0).toUpperCase() + rawRole.slice(1);
};

const UserMenu = ({ user, initials, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const shortName = useMemo(() => {
    const name = user?.name?.trim() || "User";
    return name.split(" ")[0];
  }, [user]);

  const roleLabel = useMemo(() => getRoleLabel(user), [user]);

  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        sx={{
          minWidth: "unset",
          px: 1.1,
          py: 0.7,
          borderRadius: 3,
          textTransform: "none",
          backgroundColor: "#FFFFFF",
          border: `1px solid ${brand.border}`,
          boxShadow: brand.shadow,
          color: brand.text,
          "&:hover": {
            backgroundColor: "#F7F9FB",
          },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            sx={{
              bgcolor: brand.primary,
              width: 36,
              height: 36,
              fontWeight: 700,
              fontSize: "0.92rem",
            }}
          >
            {initials}
          </Avatar>

          <Stack
            spacing={0}
            alignItems="flex-start"
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            <Typography
              sx={{
                color: brand.text,
                fontWeight: 700,
                fontSize: "0.9rem",
                lineHeight: 1.1,
              }}
            >
              {shortName}
            </Typography>

            <Typography
              sx={{
                color: brand.textSoft,
                fontWeight: 600,
                fontSize: "0.74rem",
                lineHeight: 1.1,
              }}
            >
              {roleLabel}
            </Typography>
          </Stack>

          <KeyboardArrowDownRoundedIcon
            sx={{ color: brand.textSoft, fontSize: 20 }}
          />
        </Stack>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1,
            minWidth: 180,
            borderRadius: 3,
            border: `1px solid ${brand.border}`,
            boxShadow: brand.shadow,
          },
        }}
      >
        <MenuItem disabled sx={{ opacity: 1 }}>
          <Stack spacing={0.2}>
            <Typography sx={{ fontWeight: 700, color: brand.text }}>
              {user?.name || "User"}
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: brand.textSoft }}>
              {roleLabel}
            </Typography>
          </Stack>
        </MenuItem>

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
