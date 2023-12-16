const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: "first name is required",
    },
    lastName: {
      type: String,
      trim: true,
      required: "last name is required",
    },
    phone: {
      type: String,
      trim: true,
      unique: "Phone number already exists",
      required: "phone number is required",
    },
    city: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: "Email already exists",
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
      required: "Email is required",
    },
    gender: {
      type: String,
      lowercase: true,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      required: "Country is required",
    },
    state: {
      type: String,
      trim: true,
      required: "State is required",
    },
    password: {
      type: String,
      required: "Password is required",
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
    },
    exams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
      },
    ],
    examsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    examsScheduled: {
      type: Number,
      default: 0,
      min: 0,
    },
    numberOfCandidates: {
      type: Number,
      default: 0,
      min: 0,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["Admin", "User"],
      default: "User",
    },
    voucherQty: {
      type: Number,
      default: 20,
      min: 0,
    },
    vouchersUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    voucherPurchased: {
      type: Number,
      default: 0,
      min: 0,
    },
    imageUrl: {
      type: String,
      default:
        "https://storage.googleapis.com/download/storage/v1/b/me-demo-proctor.appspot.com/o/%2Fuploads%2Fproctorme%2FImg_091d82d1-e7df-4cb7-85f5-d466a887499e.png?generation=1675893291074375&alt=media",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
