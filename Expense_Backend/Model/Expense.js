import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  discription: { type: String, require: true },
  amount: { type: Number, require: true },
  category: { type: String, require: true },
  paymentMethod: { type: String, require: true },
  createdAt: { type: Date, default: Date.now },
});
export const Expense = mongoose.model("Expense", expenseSchema);
