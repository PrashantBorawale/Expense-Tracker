import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { User } from "./Model/User.js";
import { Expense } from "./Model/Expense.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.mongoURL, {
    dbName: "Expense_tracker",
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

//Register User
app.post("/api/user/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.json({ message: "Already Exist" });

    user = await User.create({
      name,
      email,
      password,
    });
    res.json({ message: "User Registered", user });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Login User
app.post("/api/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "User not found" });

    const validPass = user.password === password;
    if (!validPass) return res.json({ message: "Invalid password" });

    res.json({ message: `welcome back ${user.userName}`, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Add expenses
app.post("/api/expenses/add", async (req, res) => {
  try {
    const { discription, amount, category, paymentMethod } = req.body;
    const expense = await Expense.create({
      discription,
      amount,
      category,
      paymentMethod,
    });
    res.json({ message: "Expenses Added", expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//viwe Expenses
app.get("/api/customer", async (req, res) => {
  try {
    const customers = await Expense.find();
    res.json(customers);
  } catch (err) {
    console.error("Expenses fetch error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Update Customer
app.put("/api/expenses/:id", async (req, res) => {
  try {
    const expenseId = req.params.id;
    const { discription, amount, category, paymentMethod } = req.body;

    // Validate fields (simple check)
    if (!discription || !amount || !category || !paymentMethod) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled." });
    }

    // Update customer in database
    const updatedExpenses = await Expense.findByIdAndUpdate(
      expenseId,
      { discription, amount, category, paymentMethod },
      { new: true } // return updated document
    );

    if (!updatedExpenses) {
      return res.status(404).json({ error: "Expenses not found." });
    }

    res.status(200).json(updatedExpenses);
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: "Server error" });
  }
});

//Delete Customer
app.delete("/api/expenses/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const deleted = await Expense.findByIdAndDelete(_id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

const port = 3000;
app.listen(port, () =>
  console.log(`Server is Connected to http://localhost:${port}`)
);


// https://github.com/PrashantBorawale/Expense-Tracker.git