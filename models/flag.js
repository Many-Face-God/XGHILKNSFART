const mongoose = require("mongoose");

const FlagSchema = new mongoose.Schema(
  {
    description: {
      type: String,
    },
    mediaLink: {
      type: String,
      required: "Media link is required",
    },
    time: {
      type: Number,
      required: "Used time is required",
    },
    title: {
      type: String,
      required: "Title is required",
    },
    isCleared: {
      type: Boolean,
      default: false,
    },
    penalty: {
      type: String,
      enum: {
        values: ["deduct mark", "nullify exam", "none"],
      },
      trim: true,
    },
    deductedMark: {
      type: Number,
      default: 0,
    },
    clearedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
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

const Flag = mongoose.model("Flag", FlagSchema);

module.exports = Flag;
