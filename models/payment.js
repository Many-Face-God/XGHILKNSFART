const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: "Email already exists",
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
      required: "Email is required",
    },
    voucher: {
      type: Number,
      default: 0,
    },
    referenceNumber: {
      type: String,
    },
    amount: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paidAt: {
      type: String,
    },
    channel: {
      type: String,
    },
    currency: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = Payment;
