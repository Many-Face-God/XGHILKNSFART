const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: Array,
    },
    numberOfAnswers: {
      type: Number,
    },
    type: {
      type: String,
      lowercase: true,
      enum: {
        values: ["theory", "multichoice", "subjective", "objective"],
      },
    },
    point: {
      type: Number,
      default: 0,
      min: 0,
    },
    options: {
      type: Array,
    },
    imgUrl: {
      type: String,
      trim: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model("Question", QuestionSchema);

module.exports = Question;
