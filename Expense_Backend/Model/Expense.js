import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  discription: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

export const Expense = mongoose.model("Expense", expenseSchema);
