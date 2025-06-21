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
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://localhost:3000/api/user/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      const { message } = response.data;

      if (message === "User not found") {
        setError("User does not exist");
      } else if (message === "Invalid password") {
        setError("Incorrect password");
      } else {
        setSuccess("Login successful");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (err) {
      setError("Login failed. Please try again.", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-blue-100 px-4">
      <Paper elevation={8} className="p-8 rounded-2xl w-full max-w-md">
        <Typography
          variant="h5"
          align="center"
          className="mb-6 font-bold text-gray-800"
        >
          Login Here
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="flex items-center my-4">
            <EmailIcon className="mr-3 text-gray-500" />
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

          {/* Password Field */}
          <div className="flex items-center mb-4">
            <LockIcon className="mr-3 text-gray-500" />
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

          {/* Remember Me */}
          <div className="mb-4">
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.remember}
                  onChange={handleChange}
                  name="remember"
                  color="primary"
                />
              }
              label="Remember Me"
            />
          </div>

          {/* Error / Success Messages */}
          {error && (
            <Typography className="text-red-600 text-sm mb-2">
              {error}
            </Typography>
          )}
          {success && (
            <Typography className="text-green-600 text-sm mb-2">
              {success}
            </Typography>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            size="small"
            fullWidth
            className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg shadow"
          >
            Login
          </Button>
        </form>

        {/* Redirect to Register */}
        <div className="mt-6 text-center">
          <span className="text-gray-700">Not a user?</span>{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-blue-600 hover:underline font-medium"
          >
            Create an account
          </button>
        </div>
      </Paper>
    </div>
  );
};

export default Login;
