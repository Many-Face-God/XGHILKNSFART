const Transaction = require("../models/transaction");

module.exports.createTransaction = async (
  title,
  description,
  status,
  voucher,
  exam,
  user
) => {
  try {
    // add date
    var date = Date.now();
    const newTransaction = await Transaction.create({
      title: title,
      description: description,
      status: status,
      voucher: voucher,
      examTitle: exam.title,
      date: date,
      exam: exam._id,
      plan: exam.plan,
      user: user._id,
      email: user.email,
    });
    if (!newTransaction) {
      throw new Error("Failed to create transaction");
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

module.exports.viewAllTransaction = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const fetchedTransactions = await Transaction.find({
      user: req.decoded.id,
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    if (!fetchedTransactions || fetchedTransactions.length < 1) {
      return res.status(204).json({
        type: "failure",
        message: "Transaction list is empty",
        transactions: [],
        totalPages: 0,
        currentPage: 0,
        totalNumberOfDocuments: 0,
      });
    }

    const totalTransactions = await Transaction.countDocuments({
      user: req.decoded.id,
    });

    return res.status(200).json({
      type: "success",
      message: "The operation was successful",
      transactions: fetchedTransactions,
      totalPages: Math.ceil(totalTransactions / limit),
      currentPage: page,
      totalNumberOfDocuments: totalTransactions,
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
