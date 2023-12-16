const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: "first name is required",
      trim: true,
    },
    lastName: {
      type: String,
      required: "last name is required",
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
      required: "Email is required",
    },
    phone: {
      type: String,
      trim: true,
      required: "phone number is required",
    },
    uniqueId: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    activityCount: {
      type: Number,
      default: 0,
    },
    flagCount: {
      type: Number,
      default: 0,
    },
    resultCount: {
      type: Number,
      default: 0,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    isCleared: {
      type: Boolean,
      default: false,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
    results: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Result",
      },
    ],
    flags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Flag",
      },
    ],
    examActivities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExamActivity",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Candidate = mongoose.model("Candidate", CandidateSchema);

module.exports = Candidate;
