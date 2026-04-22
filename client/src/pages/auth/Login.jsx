import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
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

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Password or email are not match",
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
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100dvh",
        background: "linear-gradient(180deg, #F7FCFC 0%, #EEF9F8 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        py: 1.25,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 520,
          mx: "auto",
        }}
      >
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
          <Box sx={{ textAlign: "center", mb: 3 }}>
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
              Welcome back
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

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
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
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
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
                mb: 1,
              }}
            />

            <Box sx={{ mt: 1.5, mb: 3, textAlign: "right" }}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                underline="none"
                sx={{
                  fontWeight: 600,
                  color: brand.primaryDark,
                  fontSize: "0.95rem",
                  background: "none",
                  border: "none",
                  p: 0,
                  cursor: "pointer",
                }}
              >
                Change/Forgot password?
              </Link>
            </Box>

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
              Sign In
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
            Don&apos;t have an account?{" "}
            <Link
              component={RouterLink}
              to="/register"
              underline="none"
              sx={{
                fontWeight: 700,
                color: brand.primaryDark,
              }}
            >
              Create account
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
