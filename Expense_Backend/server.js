import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
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

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

// Register user
app.post("/api/user/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let existingUser = await User.findOne({ email });
    if (existingUser) return res.json({ message: "Already Exist" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallbackSecret",
      { expiresIn: "1d" }
    );

    res.json({ message: "User Registered", token, user });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Login User
app.post("/api/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallbackSecret",
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token, user });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//see Expenses
app.get("/api/customer", verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//add Expenses
app.post("/api/expenses/add", verifyToken, async (req, res) => {
  try {
    const { discription, amount, category, paymentMethod } = req.body;
    const expense = await Expense.create({
      discription,
      amount,
      category,
      paymentMethod,
      userId: req.user.id,
    });
    res.json({ message: "Expense Added", expense });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//update Expenses
app.put("/api/expenses/:id", verifyToken, async (req, res) => {
  try {
    const { discription, amount, category, paymentMethod } = req.body;

    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { discription, amount, category, paymentMethod },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Expense not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

//delete expenses
app.delete("/api/expenses/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

const port = 3000;
app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`)
);
