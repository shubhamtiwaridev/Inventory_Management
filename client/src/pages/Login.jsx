import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import logo from "../assets/logo.png";
import { useAuth } from "../store/AuthContext";

const brand = {
  primary: "#106C6B",
  primaryDark: "#0C5A58",
  primaryLight: "#17A89F",
  soft: "#E8F7F6",
  border: "rgba(16, 108, 107, 0.16)",
  text: "#143736",
  textSoft: "#5E7675",
  pageBg: "linear-gradient(180deg, #F2FBFA 0%, #EDF8F6 45%, #E7F3F1 100%)",
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    backgroundColor: "#F8FCFB",
    "& fieldset": {
      borderColor: brand.border,
    },
    "&:hover fieldset": {
      borderColor: brand.primaryLight,
    },
    "&.Mui-focused fieldset": {
      borderColor: brand.primary,
    },
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: brand.primary,
  },
};

const Login = () => {
  const navigate = useNavigate();
  const { login, changePassword, forgotPassword, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleChangePasswordField = (e) => {
    setChangePasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOpenChangePassword = () => {
    setChangePasswordError("");
    setChangePasswordSuccess("");
    setChangePasswordData({
      email: formData.email || "",
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setOpenChangePassword(true);
  };

  const handleCloseChangePassword = () => {
    setOpenChangePassword(false);
    setChangePasswordError("");
    setChangePasswordSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(formData);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangePasswordError("");
    setChangePasswordSuccess("");

    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      setChangePasswordError("New password and confirm password do not match");
      return;
    }

    const result = await changePassword(changePasswordData);

    if (result.success) {
      setChangePasswordSuccess(result.message);
      setFormData((prev) => ({
        ...prev,
        email: changePasswordData.email,
        password: "",
      }));
      setChangePasswordData((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } else {
      setChangePasswordError(result.message);
    }
  };

  const handleForgotPassword = async () => {
    setChangePasswordError("");
    setChangePasswordSuccess("");

    if (!changePasswordData.email.trim()) {
      setChangePasswordError("Please enter your email address");
      return;
    }

    const result = await forgotPassword({
      email: changePasswordData.email,
    });

    if (result.success) {
      setChangePasswordSuccess(result.message);
    } else {
      setChangePasswordError(result.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: brand.pageBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 5,
            backgroundColor: "rgba(255,255,255,0.94)",
            border: `1px solid ${brand.border}`,
            boxShadow: "0 24px 60px rgba(16, 108, 107, 0.12)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 2.5 }}>
            <Box
              component="img"
              src={logo}
              alt="Decostyle"
              sx={{
                width: { xs: 180, sm: 210 },
                maxWidth: "100%",
                height: "auto",
                objectFit: "contain",
                mb: 1.5,
              }}
            />
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ color: brand.text, mb: 1 }}
            >
              Welcome back
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: brand.textSoft,
                maxWidth: 320,
                mx: "auto",
              }}
            >
              Sign in to continue to your Decostyle dashboard.
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5,
                borderRadius: 3,
                border: "1px solid rgba(211, 47, 47, 0.12)",
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              margin="normal"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@company.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineRoundedIcon sx={{ color: brand.primary }} />
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: brand.primary }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword((prev) => !prev)}
                      sx={{ color: brand.primary }}
                    >
                      {showPassword ? (
                        <VisibilityOffRoundedIcon />
                      ) : (
                        <VisibilityRoundedIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />

            <Box
              sx={{
                mt: 1.5,
                mb: 3,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Link
                component="button"
                type="button"
                underline="hover"
                sx={{ fontWeight: 700, color: brand.primary }}
                onClick={handleOpenChangePassword}
              >
                Change/Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.6,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: "1rem",
                textTransform: "none",
                backgroundColor: brand.primary,
                boxShadow: "0 14px 30px rgba(16, 108, 107, 0.24)",
                "&:hover": {
                  backgroundColor: brand.primaryDark,
                },
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Box>

          <Typography
            variant="body2"
            sx={{ textAlign: "center", mt: 3, color: brand.textSoft }}
          >
            Don&apos;t have an account?{" "}
            <Link
              component={RouterLink}
              to="/register"
              underline="hover"
              sx={{ fontWeight: 700, color: brand.primary }}
            >
              Create account
            </Link>
          </Typography>
        </Paper>

        <Dialog
          open={openChangePassword}
          onClose={handleCloseChangePassword}
          fullWidth
          maxWidth="sm"
          hideBackdrop
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: "0 24px 60px rgba(16, 108, 107, 0.16)",
              border: `1px solid ${brand.border}`,
              overflow: "hidden",
              backgroundColor: "rgba(255,255,255,0.98)",
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 800,
              fontSize: "1.6rem",
              color: brand.text,
              pb: 1,
            }}
          >
            Change Password
          </DialogTitle>

          <Box component="form" onSubmit={handleChangePasswordSubmit}>
            <DialogContent>
              {changePasswordSuccess && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>
                  {changePasswordSuccess}
                </Alert>
              )}

              {changePasswordError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
                  {changePasswordError}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                margin="normal"
                value={changePasswordData.email}
                onChange={handleChangePasswordField}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineRoundedIcon sx={{ color: brand.primary }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />

              <TextField
                fullWidth
                label="Old Password"
                name="oldPassword"
                type="password"
                margin="normal"
                value={changePasswordData.oldPassword}
                onChange={handleChangePasswordField}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: brand.primary }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />

              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type="password"
                margin="normal"
                value={changePasswordData.newPassword}
                onChange={handleChangePasswordField}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: brand.primary }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                margin="normal"
                value={changePasswordData.confirmPassword}
                onChange={handleChangePasswordField}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: brand.primary }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />

              <Box
                sx={{
                  mt: 1.5,
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  sx={{ fontWeight: 700, color: brand.primary }}
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </Link>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button
                onClick={handleCloseChangePassword}
                sx={{ color: brand.textSoft, fontWeight: 700 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                  backgroundColor: brand.primary,
                  "&:hover": {
                    backgroundColor: brand.primaryDark,
                  },
                }}
              >
                {loading ? "Changing..." : "Change Password"}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Login;
