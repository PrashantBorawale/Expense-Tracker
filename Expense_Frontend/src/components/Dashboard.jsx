import React, { useState, useEffect, useCallback } from "react";
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
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const categories = ["Food", "Travel", "Shopping", "Bills", "Others"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [filterCategory, setFilterCategory] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState(null);
  const [logoutModal, setLogoutModal] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(6);

  const userName = localStorage.getItem("userName");
  const token = localStorage.getItem("token");

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/customer`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setExpenses(res.data);
    } catch (err) {
      toast.error("Failed to fetch expenses.", err);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      toast.error("Please login again.");
      navigate("/login");
    } else {
      fetchExpenses();
    }
  }, [token, navigate, fetchExpenses]);

  const handleAddExpense = (newExpense) => {
    setExpenses((prev) => [...prev, newExpense]);
  };

  const handleUpdateExpense = (updated) => {
    setExpenses((prev) =>
      prev.map((e) => (e._id === updated._id ? updated : e))
    );
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/api/expenses/${deleteExpenseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setExpenses((prev) => prev.filter((e) => e._id !== deleteExpenseId));
      setDeleteExpenseId(null);
      toast.error("Expense deleted successfully.");
    } catch (err) {
      toast.error("Delete failed.", err);
    }
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
    toast.success("Logged out successfully.");
  };

  const filteredExpenses = expenses.filter((e) => {
    const expenseDate = dayjs(e.createdAt);
    const isInCategory = !filterCategory || e.category === filterCategory;
    const isInRange =
      (!fromDate || expenseDate.isAfter(dayjs(fromDate).subtract(1, "day"))) &&
      (!toDate || expenseDate.isBefore(dayjs(toDate).add(1, "day")));
    return isInCategory && isInRange;
  });

  const totalBalance = expenses.reduce((acc, e) => acc + e.amount, 0);
  const filteredTotalExpenses = filteredExpenses
    .filter((e) => e.amount < 0)
    .reduce((acc, e) => acc + Math.abs(e.amount), 0);

  const pieData = [
    {
      name: "Balance",
      value: totalBalance > 0 ? totalBalance : 0,
      color: "#4CAF50",
    },
    { name: "Expenses", value: filteredTotalExpenses, color: "red" },
  ].filter((item) => item.value > 0);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <div className="min-h-screen bg-[#F4F1DE] p-4">
      {/* AppBar */}
      <AppBar position="sticky" style={{ backgroundColor: "#E07A5F" }}>
        <Toolbar className="flex justify-between flex-wrap">
          <Typography
            variant="h6"
            className="text-white mx-auto text-center bg-[#fdf0e9] px-4 py-2 rounded"
            style={{ fontWeight: "bold", color: "#333" }}
          >
            Welcome, {userName}
          </Typography>
          <Box className="flex gap-4 flex-wrap ml-auto">
            <Button
              variant="contained"
              style={{ backgroundColor: "#D45C47", color: "#fff" }}
              onClick={() => setOpen(true)}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#b94b3b")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#D45C47")
              }
            >
              Add Transaction
            </Button>
            <Button
              variant="contained"
              style={{ backgroundColor: "#D45C47", color: "#fff" }}
              onClick={() => setLogoutModal(true)}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#b94b3b")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#D45C47")
              }
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
            <span
              className={totalBalance >= 0 ? "text-green-600" : "text-red-600"}
            >
              {totalBalance >= 0 ? "+" : "-"}₹{Math.abs(totalBalance)}
            </span>
          </Typography>
          <Typography variant="body2" className="text-red-500">
            Expenses: ₹{filteredTotalExpenses}
          </Typography>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <Typography variant="h6" className="mb-4">
          Pie-Chart for Expenses
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
                <Cell key={`cell-${index}`} fill={entry.color} />
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
            <TableHead style={{ backgroundColor: "#e8e6dd" }}>
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
              {filteredExpenses
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((expense) => (
                  <TableRow key={expense._id}>
                    <TableCell>{expense.discription}</TableCell>
                    <TableCell>
                      <span
                        className={
                          expense.amount >= 0
                            ? "text-green-500"
                            : "text-red-500"
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
                      <Button
                        startIcon={<Edit />}
                        style={{
                          backgroundColor: "#E07A5F",
                          color: "white",
                          marginRight: "8px",
                        }}
                        onClick={() => {
                          setSelectedExpense(expense);
                          setEditOpen(true);
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = "#b94b3b")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor = "#E07A5F")
                        }
                      >
                        Update
                      </Button>
                      <Button
                        startIcon={<Delete />}
                        style={{
                          backgroundColor: "#E07A5F",
                          color: "white",
                        }}
                        onClick={() => setDeleteExpenseId(expense._id)}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = "#b94b3b")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor = "#E07A5F")
                        }
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredExpenses.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[]}
        />
      </Paper>

      <UserExpenses
        open={open}
        onClose={() => setOpen(false)}
        onAdd={handleAddExpense}
      />

      <UpdateExpenses
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={selectedExpense}
        onUpdate={handleUpdateExpense}
      />

      {/* Logout Modal */}
      <Dialog open={logoutModal} onClose={() => setLogoutModal(false)}>
        <DialogTitle
          className="text-center bg-[#E07A5F] text-white font-bold"
          style={{ padding: "16px 24px 0 24px" }}
        >
          Confirm Logout
        </DialogTitle>
        <DialogContent style={{ padding: "16px 24px" }}>
          <Typography>Are you sure you want to log out?</Typography>
        </DialogContent>
        <DialogActions style={{ padding: "8px 24px 16px 24px" }}>
          <Button
            style={{
              backgroundColor: "#D45C47",
              color: "#fff",
              textTransform: "none",
            }}
            onClick={() => setLogoutModal(false)}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#b94b3b")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#D45C47")
            }
          >
            Cancel
          </Button>
          <Button
            style={{
              backgroundColor: "#D45C47",
              color: "#fff",
              textTransform: "none",
            }}
            onClick={confirmLogout}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#b94b3b")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#D45C47")
            }
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteExpenseId} onClose={() => setDeleteExpenseId(null)}>
        <DialogTitle
          className="text-center bg-[#E07A5F] text-white font-bold"
          style={{ padding: "16px 24px 0 24px" }}
        >
          Confirm Delete
        </DialogTitle>
        <DialogContent style={{ padding: "16px 24px" }}>
          <Typography>Are you sure you want to delete this expense?</Typography>
        </DialogContent>
        <DialogActions style={{ padding: "8px 24px 16px 24px" }}>
          <Button
            style={{
              backgroundColor: "#D45C47",
              color: "#fff",
              textTransform: "none",
            }}
            onClick={() => setDeleteExpenseId(null)}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#b94b3b")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#D45C47")
            }
          >
            Cancel
          </Button>
          <Button
            style={{
              backgroundColor: "#D45C47",
              color: "#fff",
              textTransform: "none",
            }}
            onClick={handleConfirmDelete}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#b94b3b")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#D45C47")
            }
          >
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Dashboard;
