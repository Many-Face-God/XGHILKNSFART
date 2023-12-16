const Candidate = require("../models/candidate.model");

// candidate enrollment
module.exports.CandidateEnrollment = async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "SERVER ERROR",
      error: err.message,
    });
  }
};
// phone check
module.exports.candidatePhoneCheck = async (req, res) => {
  try {
    const exam = req.params.id;
    const phone = req.query.phone;

    if(!phone){
      return res.status(400).json({
        type: "failure",
        message: "Phone is required"
      })
    }
    // check if candidate phone exists for the exam
    const isExist = await Candidate.exists({ phone: phone, exam: exam });
    if (isExist)
      return res.status(400).json({
        type: "failure",
        message: `Duplicate data entries. Phone ${phone} has already been used by another candidate`,
      });

    return res.status(200).json({
      type: "success",
      message: "Phone is valid",
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
// email check
module.exports.candidateEmailCheck = async (req, res) => {
  try {
    const exam = req.params.id;
    const email = req.query.email;
    if(!email){
      return res.status(400).json({
        type: "failure",
        message: "Email is required"
      })
    }
    // check if candidate mail exists for the exam
    const isExist = await Candidate.exists({ email: email.toLowerCase() , exam: exam });
    if (isExist)
      return res.status(400).json({
        type: "failure",
        message: `Duplicate data entries. email ${email} has already been used by another candidate`,
      });

    return res.status(200).json({
      type: "success",
      message: "Email is valid",
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

// exam check
module.exports.candidateExamCheck = async (req, res) => {
  try {
    return res.status(200).json({
      type: "success",
      message: "Exam is valid",
      exam: {
        title: req.exam.title,
        plan: req.exam.plan,
      },
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
