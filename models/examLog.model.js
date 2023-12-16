const mongoose = require("mongoose");

const ExamLogSchema = new mongoose.Schema(
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
    candidates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
      },
    ],
    exams: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
  },
  {
    timestamps: true,
  }
);

const ExamLog = mongoose.model("ExamLog", ExamLogSchema);

module.exports = ExamLog;
