import React, { useState } from "react";
import axios from "axios";
import {
  TextField,
  IconButton,
  Button,
  Paper,
  Typography,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://localhost:3000/api/user/register",
        formData
      );

      if (response.data.message === "Already Exist") {
        setError("User already exists");
      } else {
        setSuccess("Registered successfully");
        setFormData({ name: "", email: "", password: "" });
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setError("Something went wrong. Try again.", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-pink-100 px-4">
      <Paper elevation={8} className="p-8 rounded-2xl w-full max-w-md">
        <Typography
          variant="h5"
          align="center"
          className="mb-6 font-bold text-gray-800"
        >
          Register Here
        </Typography>

        <form onSubmit={handleSubmit}>
          <div className="flex items-center my-4">
            <PersonIcon className="mr-3 text-gray-500" />
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

          <Button
            type="submit"
            variant="contained"
            fullWidth
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow"
          >
            Register
          </Button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-gray-700">Already registered?</span>{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:underline font-medium"
          >
            Login
          </button>
        </div>
      </Paper>
    </div>
  );
};

export default Register;
