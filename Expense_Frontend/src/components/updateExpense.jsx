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
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { toast } from "react-toastify";

const categories = ["Food", "Travel", "Shopping", "Bills", "Others"];
const paymentMethods = ["Cash", "Credit Card", "UPI", "Bank-Transfer"];
const amountTypes = ["Add", "Expense"];

const UpdateExpenses = ({ open, onClose, initialData, onUpdate }) => {
  const [formData, setFormData] = useState({
    desc: "",
    amount: "",
    category: "",
    method: "",
    type: "Expense",
  });

  useEffect(() => {
    if (initialData) {
      const amt = Number(initialData.amount);
      setFormData({
        desc: initialData.discription || "",
        amount: Math.abs(amt).toString(),
        category: initialData.category || "",
        method: initialData.paymentMethod || "",
        type: amt >= 0 ? "Add" : "Expense",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { desc, amount, category, method, type } = formData;

    if (!desc || !amount || !category || !method || !type) {
      toast.error("Please fill all fields.");
      return;
    }

    if (!initialData) {
      toast.error("No expense selected.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authorized. Please login again.");
      onClose();
      return;
    }

    const finalAmount =
      type === "Expense" ? -Math.abs(Number(amount)) : Math.abs(Number(amount));

    try {
      const res = await axios.put(
        `http://localhost:3000/api/expenses/${initialData._id}`,
        {
          discription: desc,
          amount: finalAmount,
          category,
          paymentMethod: method,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Expense updated!");
      onUpdate(res.data);
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update expense.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {/* Header */}
      <Box
        sx={{
          backgroundColor: "#E07A5F",
          px: 4,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "white",
            fontWeight: "bold",
            flexGrow: 1,
            textAlign: "center",
          }}
        >
          Update Your Expenses
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Form Content */}
      <DialogContent sx={{ px: 4, pt: 3 }}>
        <Box mb={3}>
          <TextField
            label="Description"
            name="desc"
            value={formData.desc}
            onChange={handleChange}
            fullWidth
          />
        </Box>

        <Grid container spacing={5} mb={3}>
          <Grid item xs={6}>
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Type"
              >
                {amountTypes.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box mb={3}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              label="Category"
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box mb={2}>
          <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select
              name="method"
              value={formData.method}
              onChange={handleChange}
              label="Payment Method"
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ px: 4, pb: 3 }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: "#E07A5F",
            color: "#fff",
            textTransform: "none",
            fontWeight: "bold",
            borderRadius: 2,
            "&:hover": {
              backgroundColor: "#D45C47",
            },
          }}
        >
          Update Record
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateExpenses;
