const Exam = require("../models/exam");
const Plan = require("../models/plan");
const TheoryAnswer = require("../models/theory_answer");
const Candidate = require("../models/candidate.model");

const { ExamStatusUpdater } = require("../utils/status_updater");

const verifyPrevileges = async (req, res, next) => {
  try {
    const exam_id = req.params.id;
    const user_id = req.decoded.id;

    var exam = await Exam.findOne({ _id: exam_id });

    if (!exam) {
      return res.status(400).json({
        type: "failure",
        message: "Exam not found... invalid exam id",
      });
    }

    if (exam.status === "scheduled" || exam.status === "active") {
      exam.status = await ExamStatusUpdater(exam);
    }

    //check if user is the owner
    if (exam.createdBy != user_id) {
      return res.status(403).json({
        type: "failure",
        message:
          "Access Denied... User can't perform this operation as he doesn't have the required clearance. ",
      });
    }

    // check exam status
    const examStatus = exam.status.toLowerCase();
    if (examStatus === "closed" || examStatus === "active") {
      switch (examStatus) {
        case "closed":
          return res.status(400).json({
            type: "failure",
            message:
              "Can't complete the operation as the exam has already been closed",
          });
        case "active":
          return res.status(400).json({
            type: "failure",
            message:
              "Can't complete the operation as the exam is currently active",
          });
        default:
          return res.status(400).json({
            type: "failure",
            message: "Invalid exam status",
          });
      }
    }
    req.exam = exam;
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
      error: err.message,
    });
  }
  next();
};

// verify owner
const verifyUserPrevileges = async (req, res, next) => {
  try {
    const user_id = req.decoded.id;
    let exam;

    if (!req.exam) {
      exam = await Exam.findById(req.params.examId);
      if (!exam) {
        return res.status(400).json({
          type: "failure",
          message: "Invalid exam Id",
        });
      }
    } else {
      exam = req.exam;
    }

    //check if user is the owner
    if (exam.createdBy != user_id) {
      return res.status(401).json({
        type: "failure",
        message:
          "Access Denied... User can't perform this operation as he doesn't have the required clearance. ",
      });
    }
    req.exam = exam;
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "SERVER ERROR",
      error: err.message,
    });
  }
  next();
};

const verifyExamPlanIsSelected = async (req, res, next) => {
  try {
    const exam = req.exam;

    if (!exam.plan) {
      return res.status(400).json({
        type: "failure",
        message: "please select a plan",
      });
    }

    const isExist = await Plan.exists({ title: exam.plan });
    if (!isExist) {
      return res.status(400).json({
        type: "failure",
        message: "invalid exam plan",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "SERVER ERROR",
      error: err.message,
    });
  }
  next();
};

// verify exam status
const verifyExamIsNotActiveOrClosed = async (req, res, next) => {
  try {
    const exam_id = req.params.examId;
    const user_id = req.decoded.id;

    var exam = await Exam.findOne({ _id: exam_id });

    if (!exam) {
      return res.status(400).json({
        type: "failure",
        message: "Exam not found",
      });
    }

    if (exam.status === "scheduled" || exam.status === "active") {
      exam.status = await ExamStatusUpdater(exam);
    }

    // check exam status
    const examStatus = exam.status.toLowerCase();
    if (examStatus === "closed" || examStatus === "active") {
      switch (examStatus) {
        case "closed":
          return res.status(400).json({
            type: "failure",
            message:
              "Can't complete the operation as the exam window is already closed",
          });
        case "active":
          return res.status(400).json({
            type: "failure",
            message:
              "Can't complete the operation as the exam is currently active",
          });
        default:
          return res.status(400).json({
            type: "failure",
            message: "Invalid status",
          });
      }
    }
    req.exam = exam;
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
      error: err.message,
    });
  }
  next();
};

// verify exam status
const verifyExamIsCLosed = async (req, res, next) => {
  try {

    let exam;

    if (!req.exam) {
      exam = await Exam.findById(req.params.examId);
      if (!exam) {
        return res.status(400).json({
          type: "failure",
          message: "Invalid exam Id",
        });
      }
    } else {
      exam = req.exam;
    }

    if (exam.status === "scheduled" || exam.status === "active") {
      exam.status = await ExamStatusUpdater(exam);
    }

    // check exam status
    const examStatus = exam.status.toLowerCase();
    if (examStatus != "closed") {
      switch (examStatus) {
        case "scheduled":
        case "created":
          return res.status(400).json({
            type: "failure",
            message:
              "Can't complete the operation as the exam window is not closed",
          });
        case "active":
          return res.status(400).json({
            type: "failure",
            message:
              "Can't complete the operation as the exam is currently active",
          });
        default:
          return res.status(400).json({
            type: "failure",
            message: "Invalid exam status",
          });
      }
    }
    req.exam = exam;
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
      error: err.message,
    });
  }
  next();
};

const verifyExamIsScheduled = async (req, res, next) => {
  try {
    const fetchedExam = req.exam;
    switch (fetchedExam.status) {
      case "closed":
        return res.status(400).json({
          type: "failure",
          message: "The exam has already been concluded",
        });
      case "active":
        return res.status(400).json({
          type: "failure",
          message: "The exam is currently",
        });
      case "created":
        return res.status(400).json({
          type: "failure",
          message: "The exam have not been scheduled",
        });
      case "scheduled":
        break;
      default:
        return res.status(500).json({
          type: "failure",
          message: "Invalid exam status",
        });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "SERVER ERROR",
      error: err.message,
    });
  }
  next();
};

const verifyCandidateSelfEnrollment = async (req, res, next) => {
  var fetchedExam;
  try {
    const { id } = req.params;

    if (id.length < 24) {
      return res.status(400).json({
        type: "failure",
        message: "Please enter a valid exam id",
      });
    }

    fetchedExam = await Exam.findById(id);
    if (!fetchedExam)
      return res.status(400).json({
        type: "failure",
        message: "Please enter a valid exam id",
      });

    if (!fetchedExam.selfEnrollment)
      return res.status(400).json({
        type: "failure",
        message: "Invalid action... self enrollment is not enabled",
      });
  } catch (err) {
    console.log(err);
    if (err.message.includes("Cast to ObjectId failed for value")) {
      return res.status(400).json({
        type: "failure",
        message: "Please enter a valid exam id",
      });
    }
    return res.status(500).json({
      type: "failure",
      message: "SERVER ERROR",
      error: err.message,
    });
  }
  req.exam = fetchedExam;
  req.decoded = {
    id: fetchedExam.createdBy,
  };
  next();
};

const verifyResultAccessControl = async (req, res, next) => {
  // get candidateId
};

const verifyScoreTheoryAccessControl = async (req, res, next) => {
  //  get theoryAnswer Id
  const userId = req.decoded.id;
  const theoryAnswerId = req.params.theoryAnswerId;
  const fetchedTheoryAnswer = await TheoryAnswer.findById(theoryAnswerId)
    .populate({
      path: "question",
      select: ["point"],
    })
    .populate({
      path: "exam",
      select: ["createdBy"],
    })
    .populate({
      path: "examActivity",
      select: ["isMarked"],
    });
  if (!fetchedTheoryAnswer) {
    return res.status(400).json({
      type: "failure",
      message: "Invalid theory id",
    });
  }

  if (userId != fetchedTheoryAnswer.exam.createdBy) {
    return res.status(403).json({
      type: "failure",
      message: "Access Denied",
    });
  }

  if (fetchedTheoryAnswer.examActivity.isMarked) {
    return res.status(400).json({
      type: "failure",
      message: "Exam has already been marked",
    });
  }

  if (fetchedTheoryAnswer.isMarked) {
    return res.status(400).json({
      type: "failure",
      message: "Exam has already been marked",
    });
  }

  req.theoryAnswer = fetchedTheoryAnswer;
  next();
};

const verifyMarkTheoryAccessControl = async (req, res, next) => {
  // get candidateId
  const userId = req.decoded.id;
  const candidateId = req.params.candidateId;
  const fetchedCandidate = await Candidate.findById(candidateId)
    .populate({
      path: "exam",
      select: ["createdBy", "maxTheoryScore"],
    })
    .populate({
      path: "results",
    })
    .populate({
      path: "examActivities",
    });

  if (userId != fetchedCandidate.exam.createdBy) {
    return res.status(403).json({
      type: "failure",
      message: "Access Denied",
    });
  }

  if (fetchedCandidate.examActivities[0].isMarked) {
    return res.status(400).json({
      type: "failure",
      message: "Exam has already been marked",
    });
  }

  req.candidate = fetchedCandidate;
  next();
};

module.exports = {
  verifyPrevileges,
  verifyUserPrevileges,
  verifyExamIsCLosed,
  verifyExamIsNotActiveOrClosed,
  verifyExamPlanIsSelected,
  verifyExamIsScheduled,
  verifyCandidateSelfEnrollment,
  verifyResultAccessControl,
  verifyScoreTheoryAccessControl,
  verifyMarkTheoryAccessControl,
};
