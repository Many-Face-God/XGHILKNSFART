const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      required: true,
    },
    status: {
      type: String,
      trim: true,
    },
    voucher: {
      type: Number,
      default: 0,
    },
    examTitle: {
      type: String,
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
    plan: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: "Email already exists",
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
      required: "Email is required",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = Transaction;
