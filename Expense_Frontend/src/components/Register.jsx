import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  IconButton,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Ensure form fields are empty when component mounts
    setFormData({
      name: "",
      email: "",
      password: "",
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `https://expense-tracker-ozll.onrender.com/api/user/register`,
        formData
      );

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userName", user.name);

      toast.success("Registration successful!");
      setFormData({ name: "", email: "", password: "" });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        toast.error("User already exists");
      } else {
        toast.error("Something went wrong. Please try again.");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-pink-100 px-4">
      <Paper
        elevation={8}
        className="p-0 rounded-2xl w-full max-w-md overflow-hidden"
      >
        <Box
          sx={{
            backgroundColor: "#E07A5F",
            py: 2,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            Register Here
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center mb-4">
            <PersonIcon sx={{ color: "#E07A5F", marginRight: "10px" }} />
            <TextField
              name="name"
              label="Full Name"
              variant="outlined"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex items-center mb-4">
            <EmailIcon sx={{ color: "#E07A5F", marginRight: "10px" }} />
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

          <div className="flex items-center mb-6">
            <LockIcon sx={{ color: "#E07A5F", marginRight: "10px" }} />
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

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
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
            {loading ? "Registering..." : "Register"}
          </Button>

          <div className="mt-6 text-center">
            <span className="text-gray-700">Already registered?</span>{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#E07A5F] hover:text-[#D45C47] font-medium transition"
            >
              <span className="cursor-pointer">Login</span>
            </button>
          </div>
        </Box>
      </Paper>
    </div>
  );
};

export default Register;
