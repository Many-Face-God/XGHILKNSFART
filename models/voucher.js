const mongoose = require("mongoose");

const VoucherSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    testSecretKey: {
      type: String,
    },
    liveSecretKey: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Voucher = mongoose.model("Voucher", VoucherSchema);

module.exports = Voucher;
