const mongoose = require("mongoose");

const UserLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      trim: true,
      required: "action is required",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    exam: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
      },
    ],
    candidates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const UserLog = mongoose.model("UserLog", UserLogSchema);

module.exports = UserLog;
