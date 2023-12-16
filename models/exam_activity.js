const mongoose = require("mongoose");

const ExamActivitySchema = new mongoose.Schema(
  {
    startTime: {
      type: Date,
      required: "Start time is required",
    },
    endTime: {
      type: Date,
      required: "End time is required",
    },
    duration: {
      type: Number,
      default: 0,
    },
    usedTime: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "active",
    },
    objPoint: {
      type: Number,
      default: 1,
    },
    multiChoicePoint: {
      type: Number,
      default: 1,
    },
    pointToBeDeducted: {
      type: Number,
      default: 0,
    },
    timeDeducted: {
      type: Number,
      default: 0,
    },
    flagCount: {
      type: Number,
      default: 0,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    isMarked: {
      type: Boolean,
      default: false,
    },
    attemptedQuestions: [{}],
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
    examMode: {
      theory: { type: Boolean, default: false },
      objective: { type: Boolean, default: false },
      multichoice: { type: Boolean, default: false },
      subjective: { type: Boolean, default: false },
    },
    examEndDate: {
      type: Date,
      required: true,
    },
    result: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Result",
    },
    flags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Flag",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const examActivity = mongoose.model("ExamActivity", ExamActivitySchema);

module.exports = examActivity;
