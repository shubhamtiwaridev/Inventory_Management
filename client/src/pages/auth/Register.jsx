import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import logo from "../../assets/decostyle-logo.png";
import { API_BASE_URL } from "../../api/config";
import { authFetch } from "../../api/authFetch";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  IconButton,
  InputAdornment,
  MenuItem,
} from "@mui/material";

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";

const brand = {
  primary: "#139B98",
  primaryDark: "#0D6766",
  pageBg: "#F2FBFA",
  fieldBg: "#F8FCFC",
  border: "rgba(19, 155, 152, 0.22)",
  text: "#102A2A",
  muted: "#5F6F73",
  soft: "#E8F7F5",
};

const Register = () => {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    roles: "",
    password: "",
    confirmPassword: "",
  });

  const [staffTypes, setStaffTypes] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 20000); // 20 seconds

    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    const loadStaffTypes = async () => {
      try {
        setLoadingRoles(true);

        const response = await authFetch(`${API_BASE_URL}/staff-types`);

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Failed to load staff types");
        }

        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.staffTypes)
            ? data.staffTypes
            : Array.isArray(data)
              ? data
              : [];

        setStaffTypes(list);
      } catch (err) {
        setError(err.message || "Failed to load roles");
      } finally {
        setLoadingRoles(false);
      }
    };

    loadStaffTypes();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First name and last name are required");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!formData.roles.trim()) {
      setError("Role is required");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await register({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email.trim(),
        roles: formData.roles.trim(),
        password: formData.password,
      });

      setSuccessMessage(
        response.message ||
          "Registration completed successfully. Your account is pending verification by superadmin. Please login after approval.",
      );

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        roles: "",
        password: "",
        confirmPassword: "",
      });

      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Registration failed",
      );
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
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100dvh",
        background: "linear-gradient(180deg, #F7FCFC 0%, #EEF9F8 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        py: 0.75,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 620,
          mx: "auto",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: "30px",
            p: { xs: 3, sm: 4.5 },
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
                fontSize: { xs: "1.95rem", sm: "2.2rem" },
              }}
            >
              Create your account
            </Typography>
          </Box>

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

          <Box component="form" onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                mb: 2,
              }}
            >
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ color: brand.primaryDark }} />
                    </InputAdornment>
                  ),
                }}
                sx={textFieldStyles}
              />

              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                sx={textFieldStyles}
              />
            </Box>

            <TextField
              fullWidth
              label="Work Email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineIcon sx={{ color: brand.primaryDark }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                ...textFieldStyles,
                mb: 2,
              }}
            />

            <TextField
              select
              fullWidth
              label="Roles"
              name="roles"
              value={formData.roles}
              onChange={handleChange}
              disabled={loadingRoles}
              helperText={loadingRoles ? "Loading roles..." : "Select a role"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AdminPanelSettingsOutlinedIcon
                      sx={{ color: brand.primaryDark }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                ...textFieldStyles,
                mb: 2,
              }}
            >
              <MenuItem value="">Select role</MenuItem>
              {staffTypes.map((item) => (
                <MenuItem key={item._id} value={item.name}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={handleChange}
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
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
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

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
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
                mb: 3,
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                py: 1.7,
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
              Create Account
            </Button>
          </Box>

          <Typography
            sx={{
              textAlign: "center",
              color: brand.muted,
              fontSize: "0.97rem",
              mt: 3,
            }}
          >
            Already have an account?{" "}
            <Link
              component={RouterLink}
              to="/login"
              underline="none"
              sx={{
                fontWeight: 700,
                color: brand.primaryDark,
              }}
            >
              Login
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Register;
