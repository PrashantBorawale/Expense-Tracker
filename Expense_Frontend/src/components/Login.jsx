import React, { useState } from "react";
import axios from "axios";
import {
  TextField,
  IconButton,
  Button,
  Paper,
  Typography,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Box,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/user/login`,
        {
          email: formData.email,
          password: formData.password,
        }
      );

      const { message, user, token } = response.data;

      if (message.toLowerCase().includes("not found")) {
        toast.error("User does not exist");
      } else if (message.toLowerCase().includes("invalid")) {
        toast.error("Incorrect password");
      } else {
        localStorage.setItem("token", token);
        localStorage.setItem("userName", user?.name || "User");

        toast.success(`Login successful! Welcome, ${user?.name || "User"}!`);

        setFormData({ email: "", password: "", remember: false });

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (err) {
      toast.error("Login failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-100 px-4">
      <Paper
        elevation={8}
        className="p-0 rounded-2xl w-full max-w-md overflow-hidden"
      >
        {/* Heading with theme color */}
        <Box
          sx={{
            backgroundColor: "#E07A5F",
            py: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" sx={{ color: "#fff", fontWeight: "bold" }}>
            Login Here
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center mb-4">
            <EmailIcon sx={{ color: "#E07A5F", mr: 1.5 }} />
            <TextField
              name="email"
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex items-center mb-4">
            <LockIcon sx={{ color: "#E07A5F", mr: 1.5 }} />
            <TextField
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              value={formData.password}
              onChange={handleChange}
              required
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleTogglePassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
          </div>

          <div className="mb-4">
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.remember}
                  onChange={handleChange}
                  name="remember"
                  sx={{ color: "#E07A5F" }}
                />
              }
              label="Remember Me"
            />
          </div>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : null}
            sx={{
              backgroundColor: "#E07A5F",
              color: "#fff",
              fontWeight: "bold",
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              boxShadow: 2,
              "&:hover": {
                backgroundColor: "#D45C47",
              },
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="mt-6 text-center">
            <span className="text-gray-700">Not a user?</span>{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-[#E07A5F] hover:text-[#D45C47] font-medium transition"
            >
              <span className="cursor-pointer">Create an account</span>
            </button>
          </div>
        </Box>
      </Paper>
    </div>
  );
};

export default Login;
