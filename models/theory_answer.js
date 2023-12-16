const mongoose = require("mongoose");

const TheoryAnswerSchema = new mongoose.Schema(
  {
    answer: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
    },
    scoredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
    },
    isMarked: {
      type: Boolean,
      default: false,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
    examActivity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamActivity",
    },
  },
  {
    timestamps: true,
  }
);

const TheoryAnswer = mongoose.model("TheoryAnswer", TheoryAnswerSchema);

module.exports = TheoryAnswer;
