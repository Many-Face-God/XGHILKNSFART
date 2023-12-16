const mongoose = require("mongoose");

const ExamSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: "Exam Title is required",
    },
    instructions: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      lowercase: true,
      enum: {
        values: ["created", "closed", "active", "scheduled", "not active"],
      },
      default: "created",
    },
    duration: {
      type: Number,
      default: 0,
    },
    activityCount: {
      type: Number,
      default: 1,
    },
    questionCount: {
      type: Number,
      default: 0,
    },
    totalQuestionCount: {
      type: Number,
      default: 0,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    flagCount: {
      type: Number,
      default: 0,
    },
    candidatesCount: {
      type: Number,
      default: 0,
    },
    examCandidatesCount: {
      type: Number,
      default: 0,
    },
    flaggedCandidatesCount: {
      type: Number,
      default: 0,
    },
    resultCount: {
      type: Number,
      default: 0,
    },
    markedResultCount:{
      type: Number,
      default: 0,
      min: 0,
    },
    unmarkedResultCount:{
      type: Number,
      default: 0,
      min: 0,
    },
    flaggedResultsCount: {
      type: Number,
      default: 0,
    },
    approvedResultsCount: {
      type: Number,
      default: 0,
    },
    cancelledResultsCount: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    resultSetting: {
      emailResult: { type: Boolean, default: false },
      emailResultSlip: { type: Boolean, default: false },
      showScore: { type: Boolean, default: false },
    },
    punishment: {
      deductPoint: {
        status: { type: Boolean, default: false },
        points: { type: Number, default: 0 },
      },
      deductTime: {
        status: { type: Boolean, default: false },
        timeInMinutes: { type: Number, default: 0 },
      },
      suspendExam: {
        status: { type: Boolean, default: false },
      },
    },
    examMode: {
      objective: {
        status: { type: Boolean, default: false },
        numberOfQuestions: { type: Number, default: 0 },
        pointValue: { type: Number, default: 1 },
      },
      multiSelect: {
        status: { type: Boolean, default: false },
        numberOfQuestions: { type: Number, default: 0 },
        pointValue: { type: Number, default: 1 },
      },
      subjective: {
        status: { type: Boolean, default: false },
        numberOfQuestions: { type: Number, default: 0 },
        pointValue: { type: Number, default: 1 },
      },
      theory: {
        status: { type: Boolean, default: false },
        numberOfQuestions: { type: Number, default: 0 },
      },
    },
    maxTheoryScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    selfEnrollment: {
      type: Boolean,
      default: false,
    },
    selfEnrollmentPayment: {
      type: Boolean,
      default: false,
    },
    mobileCompatible: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      min: Date.now(),
    },
    endDate: {
      type: Date,
      min: Date.now(),
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
    },
    plan: {
      type: String,
    },
    priceOfPlan: {
      type: Number,
      min: 1,
    },
    candidates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
      },
    ],
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    flags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Flag",
      },
    ],
    results: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Result",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Exam = mongoose.model("Exam", ExamSchema);

module.exports = Exam;
