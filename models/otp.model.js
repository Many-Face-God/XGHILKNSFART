const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema(
  {
    otp: {
      type: String,
      trim: true,
      required: "otp is required",
    },
    type: {
      type: String,
      enum: ["password", "email"],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    valid: {
      type: Boolean,
      default: true,
    },
    expiry: {
      type: Date,
      expires: 900000,
    },
  },
  {
    timestamps: true,
  }
);
const Otp = mongoose.model("Otp", OtpSchema);

module.exports = Otp;
