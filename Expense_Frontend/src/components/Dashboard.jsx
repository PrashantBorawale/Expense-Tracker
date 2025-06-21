import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import UserExpenses from "./UserExpenses";
import UpdateExpenses from "./updateExpense";
import axios from "axios";

const categories = ["Food", "Travel", "Shopping", "Bills", "Others"];
const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];

const Dashboard = () => {
  const [filterCategory, setFilterCategory] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [userName, setUserName] = useState("");

  const fetchUserData = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/user/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUserName(res.data.name);
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/customer", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchExpenses();
  }, []);

  const handleAddExpense = (newExpense) => {
    setExpenses((prev) => [...prev, newExpense]);
  };

  const handleUpdateExpense = (updated) => {
    setExpenses((prev) =>
      prev.map((e) => (e._id === updated._id ? updated : e))
    );
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/expenses/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setExpenses((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const filteredExpenses = expenses.filter((e) => {
    const expenseDate = dayjs(e.createdAt);
    const isInCategory = !filterCategory || e.category === filterCategory;
    const isInRange =
      (!fromDate || expenseDate.isAfter(dayjs(fromDate).subtract(1, "day"))) &&
      (!toDate || expenseDate.isBefore(dayjs(toDate).add(1, "day")));
    return isInCategory && isInRange;
  });

  const totalIncome = expenses
    .filter((e) => e.amount > 0)
    .reduce((acc, e) => acc + e.amount, 0);
  const totalExpenses = expenses
    .filter((e) => e.amount < 0)
    .reduce((acc, e) => acc + Math.abs(e.amount), 0);
  const balance = totalIncome - totalExpenses;

  const pieData = categories
    .map((cat) => {
      const totalByCat = filteredExpenses
        .filter((e) => e.category === cat && e.amount < 0)
        .reduce((acc, e) => acc + Math.abs(e.amount), 0);
      return { name: cat, value: totalByCat };
    })
    .filter((data) => data.value > 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <AppBar position="static" className="bg-blue-700">
        <Toolbar className="flex justify-between flex-wrap">
          <Typography variant="h6" className="text-white mb-2 md:mb-0">
            Welcome, {userName}
          </Typography>
          <Box className="flex gap-4 flex-wrap">
            <Button
              variant="contained"
              className="bg-white text-blue-700 hover:bg-gray-200"
              onClick={() => setOpen(true)}
            >
              Add Transaction
            </Button>
            <Button
              color="inherit"
              className="border border-white text-white hover:bg-white hover:text-blue-700"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6 items-start">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="From Date"
            value={fromDate}
            onChange={(newValue) => setFromDate(newValue)}
            slotProps={{ textField: { size: "small", fullWidth: true } }}
          />
          <DatePicker
            label="To Date"
            value={toDate}
            onChange={(newValue) => setToDate(newValue)}
            slotProps={{ textField: { size: "small", fullWidth: true } }}
          />
        </LocalizationProvider>

        <FormControl fullWidth size="small">
          <InputLabel>Category</InputLabel>
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            label="Category"
          >
            <MenuItem value="">All</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <div className="bg-white p-4 rounded shadow text-center">
          <Typography variant="h6">
            Balance:{" "}
            <span className="text-green-600 font-bold">₹{balance}</span>
          </Typography>
          <Typography variant="body2">
            Income: <span className="text-green-500">₹{totalIncome}</span>
          </Typography>
          <Typography variant="body2" className="text-red-500">
            Expenses: ₹{totalExpenses}
          </Typography>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <Typography variant="h6" className="mb-4">
          Expense Breakdown (Filtered)
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${value}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction Table */}
      <Paper className="overflow-x-auto">
        <TableContainer>
          <Table>
            <TableHead className="bg-gray-200">
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense._id}>
                  <TableCell>{expense.discription}</TableCell>
                  <TableCell>
                    <span
                      className={
                        expense.amount >= 0 ? "text-green-500" : "text-red-500"
                      }
                    >
                      {expense.amount >= 0 ? "+" : "-"}₹
                      {Math.abs(expense.amount)}
                    </span>
                  </TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.paymentMethod}</TableCell>
                  <TableCell>{expense.createdAt?.split("T")[0]}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setSelectedExpense(expense);
                        setEditOpen(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(expense._id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Expense Modal */}
      <UserExpenses
        open={open}
        onClose={() => setOpen(false)}
        onAdd={handleAddExpense}
      />

      {/* Update Expense Modal */}
      <UpdateExpenses
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={selectedExpense}
        onUpdate={handleUpdateExpense}
      />
    </div>
  );
};

export default Dashboard;
