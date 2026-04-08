import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/decostyle-logo.png";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  IconButton,
  InputAdornment,
  Alert,
} from "@mui/material";

import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

const brand = {
  primary: "#139B98",
  primaryDark: "#0D6766",
  pageBg: "#F2FBFA",
  fieldBg: "#F8FCFC",
  border: "rgba(19, 155, 152, 0.22)",
  text: "#102A2A",
  muted: "#5F6F73",
};

const ForgetPassword = () => {
  const navigate = useNavigate();

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const [changePasswordData, setChangePasswordData] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);

  useEffect(() => {
    if (!error && !successMessage) return;

    const timer = setTimeout(() => {
      setError("");

      if (successMessage) {
        setChangePasswordData({
          email: "",
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setShowOldPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);

        navigate("/login");
      }

      setSuccessMessage("");
    }, 2000);

    return () => clearTimeout(timer);
  }, [error, successMessage, navigate]);

  const handleChangePasswordField = (e) => {
    setChangePasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCancelChangePassword = () => {
    setError("");
    setSuccessMessage("");
    setChangePasswordData({
      email: "",
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    navigate("/login");
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!changePasswordData.email.trim()) {
      setError("Email address is required");
      return;
    }

    if (!changePasswordData.oldPassword.trim()) {
      setError("Old password is required");
      return;
    }

    if (!changePasswordData.newPassword.trim()) {
      setError("New password is required");
      return;
    }

    if (changePasswordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      setError("New password and confirm password are not match");
      return;
    }

    try {
      setUpdatingPassword(true);

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: changePasswordData.email.trim().toLowerCase(),
          oldPassword: changePasswordData.oldPassword,
          newPassword: changePasswordData.newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      setSuccessMessage(data.message || "Password updated successfully");
    } catch (err) {
      setError(err.message || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleForgotPasswordNotification = async () => {
    setError("");
    setSuccessMessage("");

    if (!changePasswordData.email.trim()) {
      setError("Please enter email address first");
      return;
    }

    try {
      setSendingNotification(true);

      const response = await fetch(
        `${API_BASE_URL}/auth/forgot-password-notification`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: changePasswordData.email.trim().toLowerCase(),
          }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to send notification");
      }

      setSuccessMessage(
        data.message || "Password change notification sent successfully",
      );
    } catch (err) {
      setError(err.message || "Failed to send notification");
    } finally {
      setSendingNotification(false);
    }
  };

  const textFieldStyles = {
    "& .MuiInputLabel-root": {
      color: brand.muted,
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: brand.primaryDark,
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: "16px",
      bgcolor: brand.fieldBg,
      minHeight: 58,
      "& fieldset": {
        borderColor: brand.border,
      },
      "&:hover fieldset": {
        borderColor: brand.primary,
      },
      "&.Mui-focused fieldset": {
        borderColor: brand.primary,
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #F7FCFC 0%, #EEF9F8 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        py: 5,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 520 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: "30px",
            p: { xs: 3, sm: 4 },
            bgcolor: "#ffffff",
            border: `1px solid ${brand.border}`,
            boxShadow: "0 20px 50px rgba(13, 103, 102, 0.10)",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              component="img"
              src={logo}
              alt="Decostyle"
              sx={{
                width: { xs: 180, sm: 240 },
                maxWidth: "100%",
                display: "block",
                mx: "auto",
                mb: 2,
              }}
            />

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: brand.text,
                mb: 1,
                fontSize: { xs: "2rem", sm: "2.2rem" },
              }}
            >
              Change Password
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5,
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert
              severity="success"
              sx={{
                mb: 2.5,
                borderRadius: 2,
              }}
            >
              {successMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleUpdatePassword}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={changePasswordData.email}
              onChange={handleChangePasswordField}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineIcon sx={{ color: brand.primaryDark }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                ...textFieldStyles,
                mb: 1.5,
              }}
            />

            <TextField
              fullWidth
              label="Old Password"
              name="oldPassword"
              type={showOldPassword ? "text" : "password"}
              placeholder="Enter old password"
              value={changePasswordData.oldPassword}
              onChange={handleChangePasswordField}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: brand.primaryDark }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowOldPassword((prev) => !prev)}
                    >
                      {showOldPassword ? (
                        <VisibilityOffOutlinedIcon
                          sx={{ color: brand.primaryDark }}
                        />
                      ) : (
                        <VisibilityOutlinedIcon
                          sx={{ color: brand.primaryDark }}
                        />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                ...textFieldStyles,
                mb: 1.5,
              }}
            />

            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={changePasswordData.newPassword}
              onChange={handleChangePasswordField}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: brand.primaryDark }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                    >
                      {showNewPassword ? (
                        <VisibilityOffOutlinedIcon
                          sx={{ color: brand.primaryDark }}
                        />
                      ) : (
                        <VisibilityOutlinedIcon
                          sx={{ color: brand.primaryDark }}
                        />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                ...textFieldStyles,
                mb: 1.5,
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter new password"
              value={changePasswordData.confirmPassword}
              onChange={handleChangePasswordField}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: brand.primaryDark }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? (
                        <VisibilityOffOutlinedIcon
                          sx={{ color: brand.primaryDark }}
                        />
                      ) : (
                        <VisibilityOutlinedIcon
                          sx={{ color: brand.primaryDark }}
                        />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                ...textFieldStyles,
                mb: 2,
              }}
            />

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Button
                type="button"
                fullWidth
                variant="outlined"
                onClick={handleCancelChangePassword}
                sx={{
                  py: 1.5,
                  borderRadius: "16px",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "none",
                  color: brand.text,
                  borderColor: brand.border,
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={updatingPassword}
                sx={{
                  py: 1.5,
                  borderRadius: "16px",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "none",
                  background: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%)`,
                  boxShadow: "0 12px 24px rgba(19, 155, 152, 0.24)",
                  "&:hover": {
                    background: `linear-gradient(135deg, ${brand.primaryDark} 0%, ${brand.primaryDark} 100%)`,
                  },
                }}
              >
                {updatingPassword ? "Updating..." : "Update"}
              </Button>
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Typography
                sx={{
                  color: brand.muted,
                  fontSize: "0.95rem",
                }}
              >
                Forgot password?{" "}
                <Link
                  component="button"
                  type="button"
                  underline="none"
                  onClick={handleForgotPasswordNotification}
                  sx={{
                    fontWeight: 700,
                    color: brand.primaryDark,
                    background: "none",
                    border: "none",
                    p: 0,
                    cursor: "pointer",
                  }}
                >
                  {sendingNotification ? "Sending..." : "Send notification"}
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ForgetPassword;