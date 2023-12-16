const mongoose = require("mongoose");

const InstitutionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    jobTitle: {
      type: String,
      trim: true,
      required: [true, "Job Title is required"],
    },
    organizationName: {
      type: String,
      trim: true,
      required: [true, "Organization Name is required"],
    },
    organizationType: {
      type: String,
      trim: true,
      required: [true, "Official Email is required"],
    },
    officialEmail: {
      type: String,
      trim: true,
      unique: "Email already exists",
      required: [true, "Official Email is required"],
    },
    organizationAddress: {
      type: String,
      trim: true,
      required: [true, "Organization Address is required"],
    },
    staffs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Institution = mongoose.model("Institution", InstitutionSchema);

module.exports = Institution;
