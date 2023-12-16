const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    facialAuthentication: {
      type: Boolean,
      required: true,
    },
    voiceDetection: {
      type: Boolean,
      required: true,
    },
    inExamFacialSnapShot: {
      type: Number,
      default: 0,
    },
    trackHeadMovement: {
      type: Boolean,
      required: true,
    },
    trackEyeMovement: {
      type: Boolean,
      required: true,
    },
    forceFullScreen: {
      type: Boolean,
      required: true,
    },
    multiFaceDetection: {
      type: Boolean,
      required: true,
    },
    soundRecording: {
      type: Boolean,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Plan = mongoose.model("Plan", PlanSchema);

module.exports = Plan;
