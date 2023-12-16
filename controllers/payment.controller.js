const Payment = require("../models/payment");
const User = require("../models/user.model");
const Voucher = require("../models/voucher");
const axios = require("axios");
// const axios = require("axios");

module.exports.createPayment = async (req, res) => {
  try {
    const userId = req.decoded.id;
    const { reference } = req.params;
    var output;

    // fetch voucher price from database
    const voucher = await Voucher.findOne();
    if (!voucher) {
      throw new Error("Voucher price not found");
    }
    // verifyPayments
    await axios
      .get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          authorization: `Bearer ${voucher.liveSecretKey}`,
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
      })
      .then((success) => {
        output = success.data.data;
      })
      .catch((error) => {
        if (!error.response.data)
          output.message = "An error occurred while verifying payment";
        output = error.response.data;
      });
    if (!output.status) {
      return res.status(400).json({
        type: "failure",
        message: output.message,
      });
    }

    const { amount, channel, paid_at, currency, status } = output;
    // divide amount paid by voucher price to get the number of vouchers purchased
    const voucherBought = amount / 100 / voucher.price;
    // update user, increase voucherQty by number of vouchers purchased
    const updatedUser = await User.findByIdAndUpdate(userId, {
      $inc: {
        voucherPurchased: voucherBought,
        voucherQty: voucherBought,
      },
    });

    // create new payment
    const newPayment = await Payment.create({
      description: `Purchased ${voucherBought}  vouchers`,
      status: status,
      voucher: voucherBought,
      amount: amount / 100,
      channel: channel,
      currency: currency,
      paidAt: paid_at,
      user: updatedUser._id,
      email: updatedUser.email,
      referenceNumber: reference,
    });

    if (!newPayment) {
      throw new Error("Failed to create payment");
    }
    return res.status(200).json({
      type: "success",
      message: "the operation was successful",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Server Error",
      error: err.message,
    });
  }
};

module.exports.viewAllPayment = async (req, res) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const fetchedPayments = await Payment.find({
      user: req.decoded.id,
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    if (!fetchedPayments || fetchedPayments.length < 1) {
      return res.status(404).json({
        type: "failure",
        message: "Payment list is empty",
      });
    }

    const totalDocuments = await Payment.countDocuments({
      user: req.decoded.id,
    });
    return res.status(200).json({
      type: "success",
      message: "The operation was successful",
      payments: fetchedPayments,
      totalPages: Math.ceil(totalDocuments / limit),
      currentPage: page,
      totalNumberOfDocuments: totalDocuments,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Server Error",
      error: err.message,
    });
  }
};

const verifyPayment = async (reference, secretKey) => {
  await axios
    .get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        authorization: `Bearer ${secretKey}`,
        "content-type": "application/json",
        "cache-control": "no-cache",
      },
    })
    .then((success) => {
      console.log(success.data.data);
      const { amount, channel, paid_at, currency, status } = success.data.data;
    })
    .catch((error) => {
      console.log(error.response.data);
      return error.response.data;
    });
};
