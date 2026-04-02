import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import logo from "../assets/logo.png";
import { useAuth } from "../store/AuthContext";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    staffType: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [staffTypes, setStaffTypes] = useState([]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());

  const accountCompleted = formData.name.trim() !== "" && isValidEmail;

  const roleCompleted = accountCompleted && formData.staffType.trim() !== "";

  const passwordsFilled =
    formData.password.trim() !== "" && formData.confirmPassword.trim() !== "";

  const passwordsMatched = formData.password === formData.confirmPassword;

  const doneCompleted = roleCompleted && passwordsFilled && passwordsMatched;

  const steps = [
    {
      no: 1,
      label: "Account",
      completed: accountCompleted,
      connectorFilled: accountCompleted,
    },
    {
      no: 2,
      label: "Role",
      completed: roleCompleted,
      connectorFilled: roleCompleted,
    },
    {
      no: 3,
      label: "Done",
      completed: doneCompleted,
      connectorFilled: false,
    },
  ];

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      staffType: formData.staffType,
    });

    if (result.success) {
      setSuccessMessage(result.message);
      setError("");

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user",
        staffType: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 25000);
    } else {
      setSuccessMessage("");
      setError(result.message);
    }
  };

  useEffect(() => {
    const fetchStaffTypes = async () => {
      try {
        const response = await fetch(`${API_URL}/api/staff-types/public`);
        const data = await response.json();

        if (response.ok) {
          setStaffTypes(data.staffTypes || []);
        }
      } catch (error) {
        console.error("Failed to fetch staff types", error);
      }
    };

    fetchStaffTypes();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: brand.pageBg,
        display: "flex",
        alignItems: "center",
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
              sx={{
                color: brand.text,
                mb: 1,
              }}
            >
              Create your account
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: brand.textSoft,
                maxWidth: 360,
                mx: "auto",
              }}
            >
              Set up your Decostyle access with a clean, consistent onboarding
              flow.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 3.5,
              px: { xs: 0.5, sm: 1 },
            }}
          >
            {steps.map((item, index) => {
              const isHighlighted = item.completed;

              return (
                <Box
                  key={item.label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      backgroundColor: isHighlighted
                        ? brand.primary
                        : "#B8C7C6",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.9rem",
                      fontWeight: 800,
                      flexShrink: 0,
                      boxShadow: isHighlighted
                        ? "0 8px 18px rgba(16, 108, 107, 0.18)"
                        : "none",
                    }}
                  >
                    {item.no}
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      ml: 1,
                      fontWeight: isHighlighted ? 700 : 500,
                      color: isHighlighted ? brand.text : brand.textSoft,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {item.label}
                  </Typography>

                  {index !== steps.length - 1 && (
                    <Box
                      sx={{
                        height: 3,
                        flex: 1,
                        mx: 1.5,
                        borderRadius: 999,
                        backgroundColor: item.connectorFilled
                          ? brand.primaryLight
                          : "#D8E4E3",
                        transition: "all 0.25s ease",
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>

          {successMessage && (
            <Alert severity="info" sx={{ mb: 2.5, borderRadius: 3 }}>
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              margin="normal"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineRoundedIcon sx={{ color: brand.primary }} />
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />

            <TextField
              fullWidth
              label="Work Email"
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

          <FormControl fullWidth margin="normal" required>
  <InputLabel
    id="staff-type-label"
    sx={{
      "&.Mui-focused": {
        color: brand.primary,
      },
    }}
  >
    Select Staff Type
  </InputLabel>

  <Select
    labelId="staff-type-label"
    name="staffType"
    value={formData.staffType}
    label="Select Staff Type"
    onChange={handleChange}
    startAdornment={
      <InputAdornment position="start" sx={{ ml: 1 }}>
        <AdminPanelSettingsRoundedIcon sx={{ color: brand.primary }} />
      </InputAdornment>
    }
    sx={{
      borderRadius: 3,
      backgroundColor: "#F8FCFB",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: brand.border,
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: brand.primaryLight,
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: brand.primary,
      },
    }}
  >
    <MenuItem value="" disabled>
      Select Staff Type
    </MenuItem>

    {staffTypes.map((item) => (
      <MenuItem key={item._id} value={item.name}>
        {item.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Min. 6 characters"
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

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              margin="normal"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Re-enter password"
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
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      sx={{ color: brand.primary }}
                    >
                      {showConfirmPassword ? (
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 2,
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
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </Box>

          <Typography
            variant="body2"
            sx={{ mt: 3, textAlign: "center", color: brand.textSoft }}
          >
            Already have an account?{" "}
            <Link
              component={RouterLink}
              to="/login"
              underline="hover"
              sx={{ fontWeight: 700, color: brand.primary }}
            >
              Sign in
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
