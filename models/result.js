const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema(
  {
    totalExamScore: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    initialScore: {
      type: Number,
      required: true,
    },
    percentage: {
      type: String,
      default: "0%",
    },
    isFlagged: {
      type: Boolean,
      default: false,
      required: true,
    },
    right: {
      type: Number,
      default: 0,
    },
    wrong: {
      type: Number,
      default: 0,
    },
    multiChoiceFailedCount: {
      type: Number,
      default: 0,
    },
    multiChoiceCorrectCount: {
      type: Number,
      default: 0,
    },
    answered: {
      type: Number,
      default: 0,
    },
    notAnswered: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    deductedMark: {
      type: Number,
      default: 0,
    },
    isCleared: {
      type: Boolean,
      default: false,
      required: true,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    examActivity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamActivity",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Result = mongoose.model("Result", ResultSchema);

module.exports = Result;
