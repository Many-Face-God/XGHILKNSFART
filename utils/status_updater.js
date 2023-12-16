const Exam = require("../models/exam");
const User = require("../models/user.model");

module.exports.ExamStatusUpdater = async (exam) => {
  try {
    var status = exam.status.toLowerCase();
    // if exam status is completed, return status
    if (status === "closed") {
      return status;
    }
    // if exam status is active
    if (status === "active") {
      // check if current date is greater or equal to exam end date
      if (Date.now() >= exam.endDate) {
        // if yes, update exam status to completed and save to db
        await Exam.findByIdAndUpdate(exam._id, { status: "closed" });
        await User.findByIdAndUpdate(exam.createdBy, {
          $inc: { examsCompleted: 1 },
        });
        // return status as completed
        return "closed";
      } else {
        // else return status as active
        return status;
      }
    }

    // if exam status is scheduled
    if (status === "scheduled") {
      // check if current date is greater or equal to exam start date
      if (Date.now() >= exam.startDate) {
        // if yes, update exam status to active and save to db
        await Exam.findByIdAndUpdate(exam._id, { status: "active" });

        // return status as active
        return "active";
      } else {
        // else return status as scheduled
        return status;
      }
    }

    // else return exam status
    return status;
  } catch (err) {
    console.log(err);
    throw new Error(err.message);
  }
};
