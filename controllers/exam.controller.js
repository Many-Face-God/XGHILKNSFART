const Exam = require("../models/exam");
const Flag = require("../models/flag");
const Plan = require("../models/plan");
const Question = require("../models/question.model");
const User = require("../models/user.model");
const Candidate = require("../models/candidate.model");
const { ExamStatusUpdater } = require("../utils/status_updater");
const sendMail = require("../helpers/sendVerificationMail");
const examDetailTemplate = require("../public/examDetails");
const { msToHoursAndMinutes } = require("../utils/timeConverter");
const { createTransaction } = require("./transaction.controller");

module.exports.scheduleExams = async (req, res) => {
  const fetchedExam = req.exam;
  var scheduled = 0;
  var vouchers = 0;

  try {
    const { endDate, startDate, duration, plan } = req.body;

    if (!endDate || !startDate || !duration || !plan) {
      return res.status(400).json({
        type: "failure",
        message: "Required Fields can't be empty",
      });
    }
    const status = "scheduled";

    if (endDate < startDate + duration) {
      return res.status(400).json({
        type: "failure",
        message:
          "BAD REQUEST... endDate must be greater than startDate + duration",
      });
    }

    if (fetchedExam.status === "created") {
      scheduled = 1;
    }

    if (fetchedExam.plan != plan && fetchedExam.plan != null) {
      var title = "voucher refund";
      // checked voucherqty after voucher is deducted
      const newPlan = await Plan.findOne({ title: plan });
      const oldPlan = await Plan.findOne({ title: fetchedExam.plan });
      const priceDifference = oldPlan.price - newPlan.price;
      vouchers = priceDifference * fetchedExam.candidatesCount;

      if (priceDifference < 1) {
        title = "voucher deducted";
      }

      if (vouchers < 0) {
        const fetchedUser = await User.findById(fetchedExam.createdBy);
        if (!fetchedUser) {
          return res.status(400).json({
            type: "failure",
            message: "Unable to fetch user details",
          });
        }
        const voucherBalance = fetchedUser.voucherQty + vouchers;
        if (voucherBalance < 0) {
          return res.status(400).json({
            type: "failure",
            message:
              "Insufficient vouchers... Please purchase more vouchers to complete your action",
          });
        }
      }

      var voucherUsed = -1 * vouchers;
      const updatedUser = await User.findByIdAndUpdate(
        fetchedExam.createdBy,
        {
          $inc: {
            voucherQty: vouchers,
            vouchersUsed: voucherUsed,
            examsScheduled: scheduled,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      // save the transaction
      await createTransaction(
        title,
        `Changed exam plan`,
        "success",
        Math.abs(vouchers),
        req.exam,
        updatedUser
      );
    } else {
      await User.findByIdAndUpdate(fetchedExam.createdBy, {
        $inc: { examsScheduled: scheduled },
      });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      { endDate, startDate, status, duration, plan },
      {
        new: true,
        runValidators: true,
      }
    );

    if (endDate != fetchedExam.endDate || startDate != fetchedExam.startDate) {
      const fetchedCandidates = await Candidate.find({
        exam: updatedExam._id,
      }).select(["firstName", "lastName", "email", "phone"]);

      if (fetchedCandidates.length > 0) {
        // convert exam duration
        var convertedDuration = msToHoursAndMinutes(updatedExam.duration);
        // send mail
        fetchedCandidates.forEach(async (candidate) => {
          // send mail
          let examLink = `https://exam.proctorme.com`;
          let msg = examDetailTemplate(
            candidate.firstName,
            updatedExam.title,
            updatedExam._id,
            updatedExam.startDate,
            updatedExam.endDate,
            convertedDuration,
            examLink
          );
          await sendMail(msg, "Proctorme registeration mail", candidate.email);
        });
      }
    }

    return res.status(200).json({
      type: "success",
      message: "exam scheduled successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

module.exports.createExam = async (req, res) => {
  try {
    const title = req.body.title;
    const instructions = req.body.instructions;
    const examMode = req.body.examMode;
    const createdBy = req.decoded.id;
    const punishment = req.body.punishment;
    const resultSetting = req.body.resultSetting;
    const imageUrl = req.body.imageUrl;
    const selfEnrollment = req.body.selfEnrollment;
    const mobileCompatible = req.body.mobileCompatible

    const status = "created";

    const exam = await Exam.create({
      title,
      instructions,
      examMode,
      punishment,
      resultSetting,
      status,
      createdBy,
      imageUrl,
      selfEnrollment,
      mobileCompatible,
    });

    return res.status(200).json({
      type: "success",
      message: "exam created successfully",
      exam: exam._id,
    });
  } catch (err) {
    return res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

module.exports.getExams = async (req, res) => {
  const user = req.decoded.id;
  // const { page } = req.body || 1;
  // const currentpage = page;
  // const { limit } = req.body || 20;
  try {
    //const exams = await Exam.findById(req.params.id).limit(20).sort({date: descending});
    const exams = await Exam.find({ createdBy: user, isArchived: false })
      .select([
        "title",
        "imageUrl",
        "duration",
        "status",
        "plan",
        "startDate",
        "createdBy",
        "endDate",
        "createdAt",
      ])
      .sort({ createdAt: -1 });
    // .limit(limit * 1)
    // .skip((page - 1) * limit);

    // const count = await Exam.countDocuments({ createdBy: user });

    if (!exams) {
      return res.status(404).send(`Exam List is empty`);
    }

    exams.forEach(async (exam) => {
      // check d status
      // update d status
      if (exam.status === "scheduled" || exam.status === "active") {
        exam.status = await ExamStatusUpdater(exam);
      }
    });

    const fetchedExams = await Exam.find({ createdBy: user })
      .select([
        "title",
        "imageUrl",
        "duration",
        "status",
        "plan",
        "createdBy",
        "startDate",
        "endDate",
        "createdAt",
        "candidatesCount",
      ])
      .sort({ createdAt: -1 });
    // .limit(limit * 1)
    // .skip((page - 1) * limit);

    // const count = await Exam.countDocuments({ createdBy: user });

    return res.status(200).json({
      type: "success",
      message: fetchedExams,
      // totalPages: Math.ceil(count / limit),
      // currentpage,
    });
  } catch (err) {
    return res.status(500).json({
      type: "failure",
      message: "Server Error",
      error: err.message,
    });
  }
};

module.exports.viewExamSpecificDetails = async (req, res) => {
  const { id } = req.params;
  const user = req.decoded.id;
  try {
    // if exam exist, fetch exam details from the database, without sensitive information.
    const examDetails = await Exam.findById(id);

    // check if exam exist
    if (!examDetails) {
      // if exam doesn't exist, return error message.
      return res.status(400).json({
        type: "failure",
        message: `Invalid examId`,
      });
    }

    const host = examDetails.createdBy;

    //if user is not the owner
    if (host != user) {
      let exam = {
        title: examDetails.title,
        instructions: examDetails.instructions,
        imageUrl: examDetails.imageUrl,
        examMode: examDetails.examMode,
        punishment: examDetails.punishment,
        duration: examDetails.duration,
        startDate: examDetails.startDate,
        endDate: examDetails.endDate,
        status: examDetails.status,
      };
      return res.status(200).json({
        type: "success",
        data: exam,
        message: "Exam Details Retrieved",
      });
    }

    return res.status(200).json({
      type: "success",
      exam: examDetails,
      message: "Exam Details Retrieved Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      type: "failure",
      message: "Server Error",
      error: error.message,
    });
  }
};

// Update exam
module.exports.editExam = async (req, res) => {
  try {
    const examId = req.params.examId;
    const { title, instruction, imageUrl, selfEnrollment } = req.body;

    if (!title || !instruction || !imageUrl) {
      return res.status(400).json({
        type: "failure",
        message: "Required field can't be empty ",
      });
    }

    // If the exam has not started update the exam
    await Exam.findByIdAndUpdate(
      examId,
      {
        title: title,
        instructions: instruction,
        imageUrl: imageUrl,
        selfEnrollment: selfEnrollment,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      type: "success",
      message: "Exam Updated Successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "SERVER ERROR",
      error: err.message,
    });
  }
};

module.exports.archiveExam = async (req, res) => {
  try {
    const examId = req.params.examId;

    // check if exam has any flag that have not been cleared
    const fetchedFlags = await Flag.find({ exam: examId, isCleared: false });

    if (fetchedFlags.length >= 1) {
      return res.status(400).json({
        type: "failure",
        message: "Exam still has unresolved flags",
      });
    }

    const archivedExam = await Exam.findByIdAndUpdate(examId, {
      isArchived: true,
    });

    return res.status(200).json({
      type: "success",
      message: "Exam archived successfuly",
      exam: archivedExam,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "SERVER ERROR",
      error: err.message,
    });
  }
};

module.exports.deleteExam = async (req, res) => {
  try {
    const examId = req.params.examId;

    // check if the exam has been is active or completed
    const fetchedExam = req.exam;

    await Exam.findByIdAndDelete(examId);

    if (fetchedExam.candidatesCount >= 1) {
      const vouchers = await refundVouchers(
        fetchedExam.plan,
        fetchedExam.candidatesCount
      );
      if (!vouchers) {
        throw new Error("something went wrong while calculating vouchers");
      }

      if (typeof vouchers != "number") {
        return res.status(400).json({
          type: "failure",
          message: vouchers,
        });
      }

      await Candidate.deleteMany({ exam: examId });

      const updatedUser = await User.findByIdAndUpdate(fetchedExam.createdBy, {
        $inc: {
          numberOfCandidates: -fetchedExam.candidatesCount,
          vouchersUsed: -vouchers,
          voucherQty: vouchers,
        },
      });

      // save the transaction
      await createTransaction(
        "voucher refund",
        `Removed ${fetchedExam.candidatesCount} candidates`,
        "success",
        vouchers,
        req.exam,
        updatedUser
      );
    }

    await Question.deleteMany({ exam: examId });

    return res.status(200).json({
      type: "success",
      message: `Exam has been successfully deleted`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "SERVER ERROR",
      error: err.message,
    });
  }
};

// Refund Voucher
const refundVouchers = async (plan, numberOfCandidates) => {
  try {
    const fetchedPlan = await Plan.findOne({ title: plan });
    if (!fetchedPlan) {
      throw new Error("Invalid plan");
    }
    // calculate  voucher
    const numberOfVouchers = fetchedPlan.price * numberOfCandidates;
    return numberOfVouchers;
  } catch (err) {
    console.log(err);
    return err.message;
  }
};

// Deduct Voucher
const deductVoucher = async (plan, numberOfCandidates, walletBalance) => {
  try {
    const fetchedPlan = await Plan.findOne({ title: plan });
    if (!fetchedPlan) {
      throw new Error("Invalid plan");
    }

    // calculate  voucher
    const numberOfVouchers = fetchedPlan.price * numberOfCandidates;
    const balance = walletBalance - numberOfVouchers;
    const result = { numberOfVouchers: numberOfVouchers, balance: balance };
    return result;
  } catch (err) {
    console.log(err);
    return err.message;
  }
};
