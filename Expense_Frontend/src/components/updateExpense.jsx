import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

const categories = ["Food", "Travel", "Shopping", "Bills", "Others"];
const paymentMethods = ["Cash", "Credit Card", "UPI"];

const UpdateExpenses = ({ open, onClose, initialData, onUpdate }) => {
  const [formData, setFormData] = useState({
    desc: "",
    amount: "",
    category: "",
    method: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        desc: initialData.discription || "",
        amount: initialData.amount || "",
        category: initialData.category || "",
        method: initialData.paymentMethod || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (
      !formData.desc ||
      !formData.amount ||
      !formData.category ||
      !formData.method
    )
      return;

    try {
      const res = await axios.put(
        `http://localhost:3000/api/expenses/${initialData._id}`,
        {
          discription: formData.desc,
          amount: Number(formData.amount),
          category: formData.category,
          paymentMethod: formData.method,
        }
      );

      onUpdate(res.data); // Update parent state
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box className="flex items-center justify-between px-6 pt-4 pb-2">
        <Typography
          variant="h6"
          className="text-blue-700 font-semibold w-full text-center"
        >
          Update Your Expenses
        </Typography>
        <IconButton onClick={onClose} className="absolute right-1 top-0.5">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent className="px-6 pb-2 pt-0">
        <div className="mb-4">
          <TextField
            label="Description"
            name="desc"
            value={formData.desc}
            onChange={handleChange}
            fullWidth
          />
        </div>

        <div className="mb-4">
          <TextField
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            fullWidth
          />
        </div>

        <div className="mb-4">
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="mb-4">
          <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select
              name="method"
              value={formData.method}
              onChange={handleChange}
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </DialogContent>

      <DialogActions className="px-6 pb-4 m-4">
        <Button
          onClick={handleSubmit}
          variant="contained"
          className="bg-blue-600 text-white"
        >
          Update Record
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateExpenses;
