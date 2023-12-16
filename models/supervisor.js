const mongoose = require("mongoose");

const SupervisorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    required: true,
  },
  lastName: {
    type: String,
    trim: true,
    required: true,
  },
  phone: {
    type: String,
    trim: true,
    unique: "Phone number already exists",
    required: "phone number is required",
  },
  email: {
    type: String,
    trim: true,
    unique: "Email already exists",
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
    required: "Email is required",
  },
  level: {
    type: String,
    trim: true,
    required: true,
  },
  exams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
  ],
});

const Supervisor = mongoose.model("Supervisor", Supervisor);

module.exports = Supervisor;
