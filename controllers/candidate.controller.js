const Candidate = require("../models/candidate.model");
const User = require("../models/user.model");
const Exam = require("../models/exam");
const { uploadFile } = require("./picture.controller");
const path = require("path");
const fs = require("fs");
const ExamLog = require("../models/examLog.model");
const UserLog = require("../models/userLog.model");
const { v4: uuidv4 } = require("uuid");
const examDetailTemplate = require("../public/examDetails");
const sendMail = require("../helpers/sendVerificationMail");
const { msToHoursAndMinutes } = require("../utils/timeConverter");
const Plan = require("../models/plan");
const { createTransaction } = require("./transaction.controller");

module.exports.viewAllCandidates = async (req, res) => {
  try {
    const exam = req.params.examId;
    const candidates = await Candidate.find({ exam: exam });
    if (!candidates) {
      return res.status(404).json({
        type: "failure",
        message: "Candidate List is empty",
      });
    }
    return res.status(200).json({
      type: "success",
      message: "Candidates retrieved successfully",
      data: candidates,
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

module.exports.viewCandidateProfile = async (req, res) => {
  try {
    const exam_id = req.params.examId;
    const candidate_id = req.params.candidateId;

    const candidate = await Candidate.findOne({
      _id: candidate_id,
      exam: exam_id,
    });

    if (!candidate) {
      return res.status(404).json({
        type: "failure",
        message: "Candidate does not exist for this exam",
      });
    }

    return res.status(200).json({
      type: "success",
      message: "candidate successfully retrieved",
      data: candidate,
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

module.exports.updateCandidateProfile = async (req, res) => {
  try {
    const user_id = req.decoded.id;
    const exam_id = req.params.id;
    const candidate_id = req.params.candidateId;
    //fetch candidate by id and exam
    const fetchedCandidate = await Candidate.findOne({
      _id: candidate_id,
      exam: exam_id,
    });
    // check if candidate exist
    if (!fetchedCandidate) {
      return res.status(400).json({
        type: "failure",
        message: "Candidate does not exist for this exam",
      });
    }

    let emailChange = false;
    let email = req.body.email.toLowerCase();
    let phone = req.body.phone;

    // if email has been changed
    let emailExist;
    if (fetchedCandidate.email.toLowerCase() !== email) {
      emailChange = true;
      emailExist = await Candidate.exists({
        exam: exam_id,
        email: email,
      });
      if (emailExist) {
        return res.status(400).json({
          type: "failure",
          message: `candidate list contains duplicate entries. email ${email} has already been used by another candidate.`,
        });
      }
    }

    let phoneExist;
    // if phone has been changed
    if (fetchedCandidate.phone !== phone) {
      phoneExist = await Candidate.exists({
        exam: exam_id,
        phone: phone,
      });
      if (phoneExist) {
        return res.status(400).json({
          type: "failure",
          message: `candidate list contains duplicate entries. phone ${phone} has already been used by another candidate.`,
        });
      }
    }

    //update candidate
    const candidate = await Candidate.findByIdAndUpdate(
      { _id: candidate_id },
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: email,
        phone: phone,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // convert exam duration
    var convertedDuration = msToHoursAndMinutes(req.exam.duration);

    if (emailChange) {
      console.log("mail Sent");
      // sendMail
      let examLink = `https://exam.proctorme.com`;
      let msg = examDetailTemplate(
        candidate.firstName,
        req.exam.title,
        req.exam._id,
        req.exam.startDate,
        req.exam.endDate,
        convertedDuration,
        examLink
      );
      await sendMail(msg, "Proctorme Registration Mail", candidate.email);
    }

    //return response
    return res.status(200).json({
      type: "success",
      message: "candidate successfully updated",
      data: candidate,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Server Error",
      error: err.message,
    });
  }
};

module.exports.updateCandidateImage = async (req, res) => {
  var file;
  try {
    const exam_id = req.params.id;
    const candidate_id = req.params.candidateId;
    const user_id = req.decoded.id;

    //fetch candidate by id and exam
    const findCandidate = await Candidate.findOne({
      _id: candidate_id,
      exam: exam_id,
    });
    // check if candidate exist
    if (!findCandidate) {
      return res.status(400).json({
        type: "failure",
        message: "Candidate does not exist for this exam",
      });
    }

    file = req.files.photo;
    var uuid = "" + uuidv4();
    file.name = `Candidate_${candidate_id}_${uuid}${path.parse(file.name).ext}`;

    // upload file to firebase
    const uploadFileFirebase = await uploadFile(file.tempFilePath, file.name);

    if (!uploadFileFirebase) {
      return res.status(500).json({
        type: "failure",
        message: "Upload to firebase failed ",
        error: err.message,
      });
    }

    let imageUrl = uploadFileFirebase[0].metadata.mediaLink;
    // update user image url
    const candidate = await Candidate.findByIdAndUpdate(
      candidate_id,
      {
        imageUrl: imageUrl,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    deleteFile(file.tempFilePath);

    // log activity
    let action = "Candidate profile picture updated";
    let user = user_id;
    let exam = exam_id;
    await ExamLog.create({ action, user, exam });
    action = "updated candidate photo";
    await UserLog.create({ action, user });

    res.status(200).json({
      type: "success",
      message: "Candidate picture updated successfully",
      imageUrl: candidate.imageUrl,
    });
  } catch (err) {
    deleteFile(file.tempFilePath);
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

module.exports.deleteAllCandidates = async (req, res) => {
  try {
    const { title } = req.exam;
    const exam_id = req.params.id;
    const user_id = req.decoded.id;

    const candidates = await Candidate.find({ exam: exam_id });

    if (candidates.length <= 0) {
      return res.status(400).json({
        type: "failure",
        message: "Candidate list is empty",
      });
    }

    // refund vouchers
    const vouchers = await refundVouchers(req.exam.plan, candidates.length);
    if (!vouchers) {
      throw new Error("something went wrong while calculating vouchers");
    }

    if (typeof vouchers != "number") {
      return res.status(400).json({
        type: "failure",
        message: vouchers,
      });
    }

    // delete candidates
    const deletedCandidate = await Candidate.deleteMany({ exam: exam_id });

    // update user balance
    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      {
        $inc: {
          numberOfCandidates: -candidates.length,
          voucherQty: vouchers,
          vouchersUsed: -vouchers,
        },
      },
      { new: true }
    );

    // update exam candidate
    // update exam candidate count
    await Exam.findByIdAndUpdate(
      exam_id,
      { $inc: { candidatesCount: -candidates.length } },
      { new: true }
    );

    const description = `Removed ${candidates.length} candidates`;
    const status = "success";

    // save the transaction
    await createTransaction(
      "voucher refund",
      description,
      status,
      vouchers,
      req.exam,
      updatedUser
    );

    // return vouchers
    // log activity
    // let action = "Candidate list was emptied";
    // let user = user_id;
    // let exam = exam_id;
    // await ExamLog.create({ action, user, exam });
    // action = "Emptied candidate list for exam " + title;
    // await UserLog.create({ action, user });

    res.status(200).json({
      type: "success",
      data: deletedCandidate,
      message: "Candidates deleted successfully",
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

module.exports.deleteSelectedCandidates = async (req, res) => {
  try {
    const exam_id = req.params.id;
    const user_id = req.decoded.id;
    const candidateArray = req.body.candidates;

    if (!candidateArray || candidateArray.length < 1) {
      return res.status(400).json({
        type: "failure",
        message: "list of selected candidate is required",
      });
    }

    // refund vouchers
    const vouchers = await refundVouchers(req.exam.plan, candidateArray.length);
    if (!vouchers) {
      throw new Error("something went wrong while calculating vouchers");
    }

    if (typeof vouchers != "number") {
      return res.status(400).json({
        type: "failure",
        message: vouchers,
      });
    }

    var result = await Candidate.deleteMany({
      _id: {
        $in: candidateArray,
      },
    });

    // update user balance
    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      {
        $inc: {
          numberOfCandidates: -candidateArray.length,
          vouchersUsed: -vouchers,
          voucherQty: vouchers,
        },
      },
      { new: true }
    );

    // update exam candidate
    // update exam candidate count
    await Exam.findByIdAndUpdate(
      exam_id,
      { $inc: { candidatesCount: -candidateArray.length } },
      { new: true }
    );

    const description = `Removed ${candidateArray.length} candidates`;
    const status = "success";

    // save the transaction
    await createTransaction(
      "voucher refund",
      description,
      status,
      vouchers,
      req.exam,
      updatedUser
    );

    return res.status(200).json({
      type: "success",
      message: "Candidates deleted Successfully",
      data: {
        documentsFound: result.n,
        deletedCount: result.deletedCount,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Server Error",
      error: err.message,
    });
  }
};

module.exports.deleteCandidate = async (req, res) => {
  try {
    const { title, _id, plan, createdBy } = req.exam;
    const user_id = req.decoded.id;
    const exam_id = req.params.id;
    const candidate_id = req.params.candidateId;
    const candidate = await Candidate.findOne({
      _id: candidate_id,
      exam: exam_id,
    });
    if (!candidate) {
      return res.status(404).json({
        type: "failure",
        message: "Candidate not found... Invalid candidate id.",
      });
    }

    // refund vouchers
    const vouchers = await refundVouchers(plan, 1);
    if (!vouchers) {
      throw new Error("something went wrong while calculating vouchers");
    }

    if (typeof vouchers != "number") {
      return res.status(400).json({
        type: "failure",
        message: vouchers,
      });
    }

    await Candidate.findOneAndDelete({
      _id: candidate_id,
      exam: exam_id,
    });

    // update user balance
    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      {
        $inc: {
          numberOfCandidates: -1,
          voucherQty: vouchers,
          vouchersUsed: -vouchers,
        },
      },
      { new: true }
    );

    // update exam candidate
    // update exam candidate count
    await Exam.findByIdAndUpdate(
      exam_id,
      { $inc: { candidatesCount: -1 } },
      { new: true }
    );

    const description = `Removed a candidate`;
    const status = "success";

    // save the transaction
    await createTransaction(
      "voucher refund",
      description,
      status,
      vouchers,
      req.exam,
      updatedUser
    );

    // log activity
    let action =
      'Candidate "' +
      candidate.firstName +
      " " +
      candidate.lastName +
      '" was removed ';
    let user = user_id;
    let exams = exam_id;
    await ExamLog.create({ action, user, exams });
    action =
      'deleted candidate "' +
      candidate.firstName +
      " " +
      candidate.lastName +
      '" from exam with title ' +
      title;
    await UserLog.create({ action, user });

    res.status(200).json({
      type: "success",
      message: "Candidate deleted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

module.exports.enrollCandidates = async (req, res) => {
  const exam_id = req.params.id;
  const user_id = req.decoded.id;
  const candidateArray = req.body.candidates;
  const exam = req.exam;
  try {
    var message = `Candidates enrolled successfully. Kindly update Candidate's picture`;
    var inSufficientMessage =
      "Insufficient vouchers. Please purchase more vouchers to complete the action";

    if (req.body.selfEnrollment) {
      message = "Candidate enrolled successfully";
      inSufficientMessage =
        "Insufficient vouchers, please contact your host to purchase more vouchers";
    }

    if (!candidateArray || candidateArray.length <= 0) {
      return res.status(400).json({
        type: "failure",
        message: "please enter your candidates details",
      });
    }

    const numberOfCandidates = candidateArray.length;
    candidateArray.forEach((candidate) => {
      candidate.exam = req.exam._id;
      candidate.email = candidate.email.toLowerCase();
    });

    if (candidateArray.length > 1) {
      var emails = new Set();
      var phones = new Set();

      // check for duplicate email or phone in the candidate array
      for (let i = 0; i < candidateArray.length; i++) {
        var candidate = candidateArray[i];
        // check if the email exists in the emails
        if (emails.has(candidate.email)) {
          // break and throw an error
          return res.status(400).json({
            type: "failure",
            message:
              "candidate list contains duplicate entries. email " +
              candidate.email +
              " is been used by more than one candidate ",
          });
        }

        // check if the phone exists in phones
        if (phones.has(candidate.phone)) {
          // yes, break and throw an error
          return res.status(400).json({
            type: "failure",
            message:
              "candidate list contains duplicate entries. phone " +
              candidate.phone +
              " is been used by more than one candidate",
          });
        }

        // get d phone and store it in a set
        phones.add(candidate.phone);
        // get the email and store it in a set
        emails.add(candidate.email);
      }
    }

    // check if an email already exist in the database for the exam
    const db_candidates = await Candidate.find({ exam: exam_id }).select([
      "_id",
      "email",
      "phone",
    ]);

    var db_emails = new Set();
    var db_phones = new Set();

    if (db_candidates.length > 0) {
      // store d emails and phones into sets
      db_candidates.forEach((candidate) => {
        db_emails.add(candidate.email);
        db_phones.add(candidate.phone);
      });

      // loop through d candidate array
      for (let i = 0; i < candidateArray.length; i++) {
        var candidate = candidateArray[i];
        if (db_emails.has(candidate.email)) {
          return res.status(400).json({
            type: "failure",
            message:
              "Duplicate data entries. email " +
              candidate.email +
              " has already been used by a registered candidate",
          });
        }
        if (db_phones.has(candidate.phone)) {
          return res.status(400).json({
            type: "failure",
            message:
              "Duplicate data entries. phone " +
              candidate.phone +
              " has already been used by a registered candidate",
          });
        }
      }
    }

    let host = await User.findById(user_id);
    if (!host) {
      return res.status(400).json({
        type: "failure",
        message: "Invalid user id",
      });
    }
    // check voucher balance
    if (host.voucherQty <= 0) {
      return res.status(400).json({
        success: "False",
        message: inSufficientMessage,
      });
    }
    // deduct voucher
    const voucherResult = await deductVoucher(
      req.exam.plan,
      numberOfCandidates,
      host.voucherQty
    );
    if (!voucherResult) {
      throw new Error("something went wrong while calculating voucher");
    } else if (typeof voucherResult == "string") {
      return res.status(400).json({
        type: "failure",
        message: voucherResult,
      });
    }

    if (voucherResult.balance < 0) {
      return res.status(400).json({
        type: "failure",
        message: inSufficientMessage,
      });
    }
    // if (voucherBalance < 0) {
    //   const missingVouchers = Math.abs(voucherBalance);
    //   return res.status(400).json({
    //     type: "failure",
    //     message: `insufficient voucher balance. balance is short by ${missingVouchers} vouchers`,
    //   });
    // }
    // check candidate list
    //create candidate

    await Candidate.collection.insertMany(candidateArray);

    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      {
        $inc: {
          numberOfCandidates: numberOfCandidates,
          voucherQty: -voucherResult.numberOfVouchers,
          vouchersUsed: voucherResult.numberOfVouchers,
        },
      },
      { new: true, runValidators: true }
    );

    // update exam candidate count
    await Exam.findByIdAndUpdate(
      exam_id,
      { $inc: { candidatesCount: numberOfCandidates } },
      { new: true }
    );

    // save the transaction
    await createTransaction(
      "voucher deducted",
      `Added ${numberOfCandidates} candidates`,
      "success",
      voucherResult.numberOfVouchers,
      req.exam,
      updatedUser
    );

    // convert exam duration
    var convertedDuration = msToHoursAndMinutes(exam.duration);

    // send mail
    candidateArray.forEach(async (candidate) => {
      let hostname = req.headers.host;
      let examLink = `https://exam.proctorme.com`;
      let msg = examDetailTemplate(
        candidate.firstName,
        exam.title,
        exam._id,
        exam.startDate,
        exam.endDate,
        convertedDuration,
        examLink
      );
      await sendMail(msg, "Proctorme Registration Mail", candidate.email);
    });

    return res.status(201).json({
      type: "success",
      message: message,
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

// Recieving Candidates Array
module.exports.enrollCandidatesFromSheet = async (req, res) => {
  try {
    const exam_id = req.params.id;
    const user_id = req.decoded.id;
    const data = req.array;
    const candidates = [];

    data.forEach((item) => {
      if (item[1] || item[2] || item[3] || item[4]) {
        var candidate = {
          firstName: item[1],
          lastName: item[2],
          email: item[3],
          phone: item[4],
        };
        candidates.push(candidate);
      }
    });

    if (candidates.length <= 0) {
      return res.status(400).json({
        type: "failure",
        message: "Excel sheet is empty",
      });
    }

    // check for empty fields
    for (let i = 0; i < candidates.length; i++) {
      let candidate = candidates[i];
      if (
        !candidate.firstName ||
        !candidate.lastName ||
        !candidate.email ||
        !candidate.phone
      )
        return res.status(400).json({
          type: "failure",
          message: `Please fill in empty values for candidate ${i + 1}`,
        });
    }

    candidates.forEach((candidate) => {
      candidate.exam = req.exam._id;
      candidate.email = candidate.email.toLowerCase();
    });

    // check list for duplicate entries
    if (candidates.length > 1) {
      var emails = new Set();
      var phones = new Set();

      // check for duplicate email or phone in the candidate array
      for (let i = 0; i < candidates.length; i++) {
        var candidate = candidates[i];
        //     // check if the email exists in the emails
        if (emails.has(candidate.email)) {
          // yes, break and throw an error
          return res.status(400).json({
            type: "failure",
            message:
              "candidate list contains duplicate entries. email " +
              candidate.email +
              " is been used by more than one candidate in the list ",
          });
        }

        // check if the phone exists in phones
        if (phones.has(candidate.phone)) {
          // yes, break and throw an error
          return res.status(400).json({
            type: "failure",
            message:
              "candidate list contains duplicate entries. phone " +
              candidate.phone +
              " is been used by more than one candidate in the list",
          });
        }

        // get d phone and store it in a set
        phones.add(candidate.phone);
        // get the email and store it in a set
        emails.add(candidate.email);
      }
    }

    // check if an email already exist in the database for the exam
    const db_candidates = await Candidate.find({ exam: exam_id }).select([
      "_id",
      "email",
      "phone",
    ]);

    var db_emails = new Set();
    var db_phones = new Set();

    if (db_candidates.length > 0) {
      // store d emails and phones into sets
      db_candidates.forEach((candidate) => {
        db_emails.add(candidate.email);
        db_phones.add(candidate.phone);
      });
      //   // loop through d candidate array
      for (let i = 0; i < candidates.length; i++) {
        var candidate = candidates[i];
        if (db_emails.has(candidate.email)) {
          return res.status(400).json({
            type: "failure",
            message:
              "Duplicate data entries. email " +
              candidate.email +
              " has already been used by a registered candidate ",
          });
        }

        if (db_phones.has(candidate.phone)) {
          return res.status(400).json({
            type: "failure",
            message:
              "Duplicate data entries. phone " +
              candidate.phone +
              " has already been used by a registered candidate",
          });
        }
      }
    }

    let host = await User.findById(user_id);
    if (!host) {
      return res.status(400).json({
        type: "failure",
        message: "Invalid user id",
      });
    }
    // check voucher balance
    if (host.voucherQty <= 0) {
      return res.status(400).json({
        type: "failure",
        message: "Your balance is zero. Please purchase vouchers to continue`",
      });
    }

    // deduct voucher
    const voucherResult = await deductVoucher(
      req.exam.plan,
      candidates.length,
      host.voucherQty
    );

    if (!voucherResult) {
      throw new Error("something went wrong while calculating voucher");
    } else if (typeof voucherResult == "string") {
      return res.status(400).json({
        type: "failure",
        message: voucherResult,
      });
    }

    if (voucherResult.balance < 0) {
      return res.status(400).json({
        type: "failure",
        message: "Insufficient vouchers...",
      });
    }

    // insert candidates into db
    await Candidate.collection.insertMany(candidates);

    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      {
        $inc: {
          numberOfCandidates: candidates.length,
          vouchersUsed: voucherResult.numberOfVouchers,
          voucherQty: -voucherResult.numberOfVouchers,
        },
      },
      { new: true }
    );

    // Update exam candidate count
    await Exam.findByIdAndUpdate(
      exam_id,
      { $inc: { candidatesCount: candidates.length } },
      { new: true }
    );

    // save the transaction
    await createTransaction(
      "voucher deducted",
      `Added ${candidates.length} candidates`,
      "success",
      voucherResult.numberOfVouchers,
      req.exam,
      updatedUser
    );

    // convert exam duration
    var convertedDuration = msToHoursAndMinutes(req.exam.duration);

    // send mail
    candidates.forEach(async (candidate) => {
      let examLink = `https://exam.proctorme.com`;
      let msg = examDetailTemplate(
        candidate.firstName,
        req.exam.title,
        req.exam._id,
        req.exam.startDate,
        req.exam.endDate,
        convertedDuration,
        examLink
      );
      await sendMail(msg, "Proctorme Registration Mail", candidate.email);
    });

    return res.status(201).json({
      type: "success",
      message: `Enrollment was successful and vouchers has been  deducted. Kindly update Candidate's pictures`,
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

// Read Excel file
module.exports.readExcelFile = async (req, res) => {
  // try {
  //   const exam_id = req.params.id;
  //   const user_id = req.decoded.id;
  //   // Check if a file is uploaded
  //   const file = req.files.sheet;
  //   // Rename the file
  //   file.name = `excel_${exam_id}_${user_id}_${file.name}_${
  //     path.parse(file.name).ext
  //   }`;
  //   await file.mv(`${"./public/uploads/excel"}/${file.name}`);
  //   const workbook = XLSX.readFile(`${"./public/uploads/excel"}/${file.name}`);
  //   const wsname = workbook.SheetNames[0];
  //   const ws = workbook.Sheets[wsname];
  //   const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  //   var removed = data.shift();
  //   const candidates = [];
  //   data.forEach((item, index, array) => {
  //     var candidate = {
  //       firstName: item[1],
  //       lastName: item[2],
  //       email: item[3],
  //       phone: item[4],
  //     };
  //     candidates.push(candidate);
  //   });
  //   var createdCandidates = createCandidates(candidates, exam_id, user_id);
  //   //delete the excel file;
  //   return res.status(200).json({ data: createdCandidates });
  // } catch (err) {
  //   console.log(err);
  //   return res.status(500).json({
  //     type: "failure",
  //     message: `Internal Server Error`,
  //     error: err.message,
  //   });
  // }
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

// Refund Voucher
const refundVoucher = async (plan, numberOfCandidates, walletBalance) => {
  try {
    const fetchedPlan = await Plan.findOne({ title: plan });
    if (!fetchedPlan) {
      throw new Error("Invalid plan");
    }
    // calculate  voucher
    const numberOfVouchers = fetchedPlan.price * numberOfCandidates;
    const balance = walletBalance + numberOfVouchers;
    const result = { numberOfVouchers: numberOfVouchers, balance: balance };
    return result;
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

const deleteFile = (path) => {
  try {
    fs.unlinkSync(path);
  } catch (err) {
    console.log(err);
  }
};
